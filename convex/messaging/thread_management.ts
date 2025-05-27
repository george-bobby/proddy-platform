import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from '../_generated/dataModel';
import { query } from '../_generated/server';
import { populateUser, populateMember } from './message_queries';

// Get thread messages for a workspace
export const getThreadMessages = query({
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

			// Get all thread messages in the workspace
			const threadMessages = await ctx.db
				.query('messages')
				.withIndex('by_workspace_id', (q) =>
					q.eq('workspaceId', args.workspaceId)
				)
				.filter((q) => q.neq(q.field('parentMessageId'), null))
				.order('desc')
				.collect();

			// Get all parent messages in one go
			const parentMessageIds = new Set(
				threadMessages
					.map((msg) => msg.parentMessageId)
					.filter((id): id is Id<'messages'> => id !== null && id !== undefined)
			);

			if (parentMessageIds.size === 0) {
				return [];
			}

			const parentMessages = await Promise.all(
				Array.from(parentMessageIds).map((id) => ctx.db.get(id))
			);
			const parentMessageMap = new Map(
				parentMessages.filter(Boolean).map((msg) => [msg!._id, msg])
			);

			// Get all members and users in one go
			const memberIds = new Set<Id<'members'>>();
			threadMessages.forEach((message) => memberIds.add(message.memberId));
			parentMessages.forEach((message) => {
				if (message?.memberId) memberIds.add(message.memberId);
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

			const channelMap = new Map(
				channels.map((channel) => [channel._id, channel])
			);
			const conversationMap = new Map(
				conversations.map((conversation) => [conversation._id, conversation])
			);

			// Get thread messages with context
			const threadsWithContext = threadMessages
				.map((message) => {
					if (!message.parentMessageId) return null;

					const parentMessage = parentMessageMap.get(message.parentMessageId);
					if (!parentMessage) return null;

					const parentMember = memberMap.get(parentMessage.memberId);
					if (!parentMember) return null;

					const parentUser = userMap.get(parentMember.userId);
					if (!parentUser) return null;

					const currentMember = memberMap.get(message.memberId);
					if (!currentMember) return null;

					const currentUser = userMap.get(currentMember.userId);
					if (!currentUser) return null;

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

					return {
						message,
						parentMessage,
						parentUser,
						currentUser,
						context,
					};
				})
				.filter(
					(thread): thread is NonNullable<typeof thread> => thread !== null
				);

			return threadsWithContext;
		} catch (error) {
			throw error;
		}
	},
});
