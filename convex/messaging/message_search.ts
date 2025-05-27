import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from '../_generated/dataModel';
import { query } from '../_generated/server';
import { populateUser, populateMember } from './message_queries';

// Get all messages for a user in a workspace
export const getUserMessages = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		try {
			const identity = await ctx.auth.getUserIdentity();
			if (!identity) {
				throw new Error('Not authenticated');
			}

			const userId = identity.subject;
			const baseUserId = userId.split('|')[0];

			// Get the current member using the base user ID
			const currentMember = await ctx.db
				.query('members')
				.withIndex('by_workspace_id_user_id', (q) =>
					q
						.eq('workspaceId', args.workspaceId)
						.eq('userId', baseUserId as Id<'users'>)
				)
				.unique();

			// If no member found, return empty array
			if (!currentMember) {
				return [];
			}

			// Get all messages for the current member in this workspace
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_workspace_id', (q) =>
					q.eq('workspaceId', args.workspaceId)
				)
				.filter((q) => q.eq(q.field('memberId'), currentMember._id))
				.order('desc')
				.collect();

			// Get all channels and conversations in one go
			const [channels, conversations] = await Promise.all([
				ctx.db
					.query('channels')
					.withIndex('by_workspace_id', (q) =>
						q.eq('workspaceId', args.workspaceId)
					)
					.collect(),
				ctx.db
					.query('conversations')
					.withIndex('by_workspace_id', (q) =>
						q.eq('workspaceId', args.workspaceId)
					)
					.collect(),
			]);

			// Create lookup maps for faster access
			const channelMap = new Map(
				channels.map((channel) => [channel._id, channel])
			);
			const conversationMap = new Map(
				conversations.map((conversation) => [conversation._id, conversation])
			);

			// Get all members and users in one go
			const memberIds = new Set<Id<'members'>>();
			messages.forEach((message) => memberIds.add(message.memberId));
			conversations.forEach((conversation) => {
				memberIds.add(conversation.memberOneId);
				memberIds.add(conversation.memberTwoId);
			});

			const members = await Promise.all(
				Array.from(memberIds).map((id) => ctx.db.get(id))
			);
			const memberMap = new Map(
				members.filter(Boolean).map((member) => [member!._id, member])
			);

			const userIds = new Set<Id<'users'>>();
			members.forEach((member) => {
				if (member?.userId) userIds.add(member.userId);
			});

			const users = await Promise.all(
				Array.from(userIds).map((id) => ctx.db.get(id))
			);
			const userMap = new Map(
				users.filter(Boolean).map((user) => [user!._id, user])
			);

			// Get channel and conversation information for each message
			const messagesWithContext = messages.map((message) => {
				let context: {
					name: string;
					type: 'channel' | 'conversation' | 'unknown';
					id: Id<'channels'> | Id<'conversations'>;
					memberId?: Id<'members'>;
				} = {
					name: 'Unknown',
					type: 'unknown',
					id:
						message.channelId ||
						message.conversationId ||
						('' as Id<'channels'> | Id<'conversations'>),
				};

				if (message.channelId) {
					const channel = channelMap.get(message.channelId);
					if (channel) {
						context = {
							name: channel.name,
							type: 'channel',
							id: channel._id,
						};
					}
				} else if (message.conversationId) {
					const conversation = conversationMap.get(message.conversationId);
					if (conversation) {
						const currentMember = memberMap.get(message.memberId);
						if (currentMember) {
							const otherMemberId =
								conversation.memberOneId === currentMember._id
									? conversation.memberTwoId
									: conversation.memberOneId;
							const otherMember = memberMap.get(otherMemberId);
							if (otherMember) {
								const otherUser = userMap.get(otherMember.userId);
								if (otherUser) {
									context = {
										name: `Direct Message with ${otherUser.name}`,
										type: 'conversation',
										id: conversation._id,
										memberId: otherMember._id,
									};
								}
							}
						}
					}
				}

				return {
					...message,
					context,
				};
			});

			return messagesWithContext;
		} catch (error) {
			throw error;
		}
	},
});

// Get all messages in a workspace (for admin/debugging)
export const getAllWorkspaceMessages = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		try {
			const identity = await ctx.auth.getUserIdentity();
			if (!identity) {
				throw new Error('Not authenticated');
			}

			// Get all messages in the workspace
			const allMessages = await ctx.db
				.query('messages')
				.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
				.collect();

			console.log(
				'getAllWorkspaceMessages - total messages:',
				allMessages.length
			);
			console.log('getAllWorkspaceMessages - messages:', allMessages);

			// Get all members in the workspace
			const members = await ctx.db
				.query('members')
				.filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
				.collect();

			console.log('getAllWorkspaceMessages - members:', members);

			return {
				messages: allMessages,
				members,
			};
		} catch (error) {
			console.error('getAllWorkspaceMessages - Error:', error);
			throw error;
		}
	},
});

// Get message bodies for specific message IDs
export const getMessageBodies = query({
	args: {
		messageIds: v.array(v.id('messages')),
	},
	handler: async (ctx, args) => {
		try {
			const userId = await getAuthUserId(ctx);
			if (!userId) return [];

			// Early return if no message IDs provided
			if (args.messageIds.length === 0) return [];

			// Fetch all messages in a single batch query
			const messages = await ctx.db
				.query('messages')
				.filter((q) =>
					q.or(...args.messageIds.map((id) => q.eq(q.field('_id'), id)))
				)
				.collect();

			if (messages.length === 0) return [];

			// Extract all unique member IDs from messages
			const memberIds = new Set(messages.map((msg) => msg.memberId));

			// Fetch all members in a single batch
			const members = await ctx.db
				.query('members')
				.filter((q) =>
					q.or(...Array.from(memberIds).map((id) => q.eq(q.field('_id'), id)))
				)
				.collect();

			// Create a map of member ID to member
			const memberMap = new Map(members.map((member) => [member._id, member]));

			// Extract all unique user IDs from members
			const userIds = new Set(members.map((member) => member.userId));

			// Fetch all users in a single batch
			const users = await ctx.db
				.query('users')
				.filter((q) =>
					q.or(...Array.from(userIds).map((id) => q.eq(q.field('_id'), id)))
				)
				.collect();

			// Create a map of user ID to user
			const userMap = new Map(users.map((user) => [user._id, user]));

			// Map messages to the required format
			const formattedMessages = messages.map((message) => {
				const member = memberMap.get(message.memberId);
				if (!member) return null;

				const user = userMap.get(member.userId);
				if (!user) return null;

				return {
					id: message._id,
					body: message.body,
					authorName: user.name,
					creationTime: message._creationTime,
				};
			});

			return formattedMessages.filter(
				(msg): msg is NonNullable<typeof msg> => msg !== null
			);
		} catch (error) {
			console.error('Error in getMessageBodies:', error);
			return [];
		}
	},
});

// Get recent messages from a specific channel
export const getRecentChannelMessages = query({
	args: {
		channelId: v.id('channels'),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		try {
			const userId = await getAuthUserId(ctx);
			if (!userId) {
				return [];
			}

			const limit = args.limit || 20; // Default to 20 messages if not specified

			// Query for messages in this specific channel
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_channel_id', (q) => q.eq('channelId', args.channelId))
				.order('desc') // Most recent first
				.take(limit);

			// Filter out thread replies after fetching
			const nonThreadMessages = messages.filter((msg) => !msg.parentMessageId);

			// Use the filtered messages for processing
			const filteredMessages =
				nonThreadMessages.length > 0 ? nonThreadMessages : messages;

			if (filteredMessages.length === 0) {
				return [];
			}

			// Extract all unique member IDs from filtered messages
			const memberIds = new Set(filteredMessages.map((msg) => msg.memberId));

			// Fetch all members in a single batch
			const members = await ctx.db
				.query('members')
				.filter((q) =>
					q.or(...Array.from(memberIds).map((id) => q.eq(q.field('_id'), id)))
				)
				.collect();

			// Create a map of member ID to member
			const memberMap = new Map(members.map((member) => [member._id, member]));

			// Extract all unique user IDs from members
			const userIds = new Set(members.map((member) => member.userId));

			// Fetch all users in a single batch
			const users = await ctx.db
				.query('users')
				.filter((q) =>
					q.or(...Array.from(userIds).map((id) => q.eq(q.field('_id'), id)))
				)
				.collect();

			// Create a map of user ID to user
			const userMap = new Map(users.map((user) => [user._id, user]));

			// Map filtered messages to the required format and reverse to get chronological order
			const formattedMessages = filteredMessages
				.map((message) => {
					const member = memberMap.get(message.memberId);
					if (!member) {
						return null;
					}

					const user = userMap.get(member.userId);
					if (!user) {
						return null;
					}

					return {
						id: message._id,
						body: message.body,
						authorName: user.name,
						creationTime: message._creationTime,
					};
				})
				.filter((msg): msg is NonNullable<typeof msg> => msg !== null)
				.reverse(); // Reverse to get chronological order (oldest first)

			return formattedMessages;
		} catch (error) {
			console.error('Error in getRecentChannelMessages:', error);
			return [];
		}
	},
});
