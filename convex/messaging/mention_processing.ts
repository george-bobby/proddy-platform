import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Doc, Id } from '../_generated/dataModel';
import { query, mutation } from '../_generated/server';
import { populateUser, populateMember, populateReactions, populateThread } from './message_queries';

// Get messages that mention the current user
export const getMentionedMessages = query({
	args: {
		workspaceId: v.id('workspaces'),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		try {
			const userId = await getAuthUserId(ctx);
			if (!userId) {
				console.log('getMentionedMessages - No userId found');
				return [];
			}

			// Get the current member
			const currentMember = await ctx.db
				.query('members')
				.withIndex('by_workspace_id_user_id', (q) =>
					q
						.eq('workspaceId', args.workspaceId)
						.eq('userId', userId as Id<'users'>)
				)
				.unique();

			if (!currentMember) {
				console.log(
					'getMentionedMessages - No currentMember found for userId:',
					userId
				);
				return [];
			}

			console.log('getMentionedMessages - currentMember:', currentMember);

			const limit = args.limit || 50; // Default to 50 messages

			// Get all messages in the workspace
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_workspace_id', (q) =>
					q.eq('workspaceId', args.workspaceId)
				)
				.order('desc') // Most recent first
				.take(limit);

			console.log(
				'getMentionedMessages - total messages found:',
				messages.length
			);

			if (messages.length === 0) {
				console.log('getMentionedMessages - No messages found in workspace');
				return [];
			}

			// Filter messages that contain mentions of the current user (including self-mentions)
			const mentionedMessages = [];

			console.log(
				'getMentionedMessages - currentMember._id:',
				currentMember._id
			);

			for (const message of messages) {
				// Check if the message body contains a mention of the current user
				// There are multiple ways mentions might appear in the message body:
				// 1. data-member-id="memberId" (in the HTML attribute)
				// 2. @username (in the text content)
				// 3. The message might be stored as a JSON string with Quill Delta format

				let hasMention = false;

				try {
					// First, try to find by member ID in the HTML
					const memberIdPattern = `data-member-id="${currentMember._id}"`;
					hasMention = message.body.includes(memberIdPattern);

					// If we didn't find a mention by ID, try to get the current user's name
					if (!hasMention && currentMember) {
						// Get the user associated with the current member to find their name
						const currentUser = await populateUser(ctx, currentMember.userId);
						if (currentUser && currentUser.name) {
							// Look for @username pattern in various formats
							const usernameMentionPatterns = [
								`>@${currentUser.name}<`,
								`@${currentUser.name}`,
								`"@${currentUser.name}"`,
								`'@${currentUser.name}'`,
							];

							for (const pattern of usernameMentionPatterns) {
								if (message.body.includes(pattern)) {
									hasMention = true;
									break;
								}
							}
						}
					}

					// If still no mention found, try parsing the body as JSON (Quill Delta format)
					if (!hasMention) {
						try {
							const parsedBody = JSON.parse(message.body);
							if (parsedBody.ops) {
								// It's a Quill Delta format
								for (const op of parsedBody.ops) {
									if (op.insert && typeof op.insert === 'string') {
										// Check if the insert contains a mention of the current member ID
										if (
											op.insert.includes(
												`data-member-id="${currentMember._id}"`
											)
										) {
											hasMention = true;
											break;
										}

										// If we have the user's name, check for that too
										const currentUser = await populateUser(
											ctx,
											currentMember.userId
										);
										if (currentUser && currentUser.name) {
											if (op.insert.includes(`@${currentUser.name}`)) {
												hasMention = true;
												break;
											}
										}
									}
								}
							}
						} catch (e) {
							// Not JSON, continue with other checks
						}
					}
				} catch (e) {
					console.error('Error checking for mentions:', e);
				}

				console.log('getMentionedMessages - checking message:', {
					messageId: message._id,
					messageBody:
						message.body.substring(0, 100) +
						(message.body.length > 100 ? '...' : ''),
					hasMention,
				});

				if (hasMention) {
					// Get the member who sent the message
					const member = await populateMember(ctx, message.memberId);
					if (!member) continue;

					// Get the user associated with the member
					const user = await populateUser(ctx, member.userId);
					if (!user) continue;

					// Get reactions for the message
					const reactions = await populateReactions(ctx, message._id);

					// Get image URL if present
					const image = message.image
						? await ctx.storage.getUrl(message.image)
						: undefined;

					// Format reactions with counts
					const reactionsWithCounts = reactions.reduce(
						(acc, reaction) => {
							const existingReaction = acc.find(
								(r) => r.value === reaction.value
							);

							if (existingReaction) {
								existingReaction.count += 1;
								existingReaction.memberIds.push(reaction.memberId);
								return acc;
							}

							return [
								...acc,
								{
									...reaction,
									count: 1,
									memberIds: [reaction.memberId],
								},
							];
						},
						[] as Array<
							Omit<Doc<'reactions'>, 'memberId'> & {
								count: number;
								memberIds: Id<'members'>[];
							}
						>
					);

					// Get thread information if this message has replies
					const thread = await populateThread(ctx, message._id);

					// Add context information (channel or conversation)
					let context = null;

					if (message.channelId) {
						const channel = await ctx.db.get(message.channelId);
						if (channel) {
							context = {
								type: 'channel',
								name: channel.name,
								id: channel._id,
							};
						}
					} else if (message.conversationId) {
						const conversation = await ctx.db.get(message.conversationId);
						if (conversation) {
							const otherMemberId =
								conversation.memberOneId === message.memberId
									? conversation.memberTwoId
									: conversation.memberOneId;
							const otherMember = await populateMember(ctx, otherMemberId);
							if (otherMember) {
								const otherUser = await populateUser(ctx, otherMember.userId);
								if (otherUser) {
									context = {
										type: 'conversation',
										name: `Direct Message with ${otherUser.name}`,
										id: conversation._id,
										memberId: otherMember._id,
									};
								}
							}
						}
					}

					// Add the message to the result
					mentionedMessages.push({
						...message,
						user: {
							name: user.name,
							image: user.image,
						},
						reactions: reactionsWithCounts,
						image,
						threadCount: thread?.count,
						threadImage: thread?.image,
						threadName: thread?.name,
						threadTimestamp: thread?.timestamp,
						context,
					});
				}
			}

			console.log(
				'getMentionedMessages - found mentioned messages:',
				mentionedMessages.length
			);
			return mentionedMessages;
		} catch (error) {
			console.error('Error in getMentionedMessages:', error);
			return [];
		}
	},
});

// Create a test message with mentions (for testing purposes)
export const createTestMentionMessage = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
	},
	handler: async (ctx, args) => {
		try {
			const userId = await getAuthUserId(ctx);
			if (!userId) {
				throw new Error('Unauthorized');
			}

			// Get the current member
			const currentMember = await ctx.db
				.query('members')
				.withIndex('by_workspace_id_user_id', (q) =>
					q
						.eq('workspaceId', args.workspaceId)
						.eq('userId', userId as Id<'users'>)
				)
				.unique();

			if (!currentMember) {
				throw new Error('Member not found');
			}

			// Get the user associated with the member
			const user = await populateUser(ctx, currentMember.userId);
			if (!user) {
				throw new Error('User not found');
			}

			// Create a mention HTML element - this is the format used in the actual app
			const mentionHtml = `<a href="/workspace/${args.workspaceId}/member/${currentMember._id}" id="mention-test-${Date.now()}" class="user-mention" data-member-id="${currentMember._id}" data-workspace-id="${args.workspaceId}" target="_self" style="color: #6366f1; font-weight: bold; cursor: pointer; text-decoration: none;">@${user.name}</a>`;

			// Create a message body with the mention in Quill Delta format
			// This is the format that the editor uses and the renderer expects
			const messageBody = JSON.stringify({
				ops: [
					{ insert: 'This is a test message with a mention: ' },
					{ insert: mentionHtml, attributes: { html: true } },
					{ insert: '\n' },
				],
			});

			console.log(
				'createTestMentionMessage - created message body:',
				messageBody
			);

			// Insert the message
			const messageId = await ctx.db.insert('messages', {
				memberId: currentMember._id,
				body: messageBody,
				workspaceId: args.workspaceId,
				channelId: args.channelId,
			});

			return messageId;
		} catch (error) {
			console.error('Error in createTestMentionMessage:', error);
			throw error;
		}
	},
});
