import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { type QueryCtx, action, query } from './_generated/server';
import { api } from './_generated/api';

// Helper function to get a member by workspace and user ID
const getMember = async (
	ctx: QueryCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
) => {
	return await ctx.db
		.query('members')
		.withIndex('by_workspace_id_user_id', (q) =>
			q.eq('workspaceId', workspaceId).eq('userId', userId)
		)
		.unique();
};

// Action to send email notification for thread replies
export const sendThreadReplyEmail = action({
	args: {
		messageId: v.id('messages'),
		parentMessageId: v.id('messages'),
	},
	handler: async (
		ctx,
		{
			messageId,
			parentMessageId,
		}: { messageId: Id<'messages'>; parentMessageId: Id<'messages'> }
	) => {
		try {
			// Get the reply message
			const replyMessage = await ctx.runQuery(api.messages._getMessageById, {
				messageId,
			});
			if (!replyMessage) {
				console.error('Reply message not found:', messageId);
				return { success: false, error: 'Reply message not found' };
			}

			// Get the parent message
			const parentMessage = await ctx.runQuery(api.messages._getMessageById, {
				messageId: parentMessageId,
			});
			if (!parentMessage) {
				console.error('Parent message not found:', parentMessageId);
				return { success: false, error: 'Parent message not found' };
			}

			// Get the replier (author of the reply message)
			const replier = await ctx.runQuery(api.members._getMemberById, {
				memberId: replyMessage.memberId,
			});
			if (!replier || !replier.user) {
				console.error('Replier not found:', replyMessage.memberId);
				return { success: false, error: 'Replier not found' };
			}

			// Get the original message author
			const originalAuthor = await ctx.runQuery(api.members._getMemberById, {
				memberId: parentMessage.memberId,
			});
			if (!originalAuthor || !originalAuthor.user) {
				console.error('Original author not found:', parentMessage.memberId);
				return { success: false, error: 'Original author not found' };
			}

			// Don't send email if the replier is the same as the original author
			if (replyMessage.memberId === parentMessage.memberId) {
				console.log(
					'Skipping email notification: User replied to their own message'
				);
				return { success: true, skipped: true };
			}

			// Get the channel name if available
			let channelName = 'a channel';
			if (replyMessage.channelId) {
				const channel = await ctx.runQuery(api.channels._getChannelById, {
					channelId: replyMessage.channelId,
				});
				if (channel) {
					channelName = channel.name;
				}
			}

			// Extract message previews
			let originalMessagePreview = 'Original message';
			let replyMessagePreview = 'Reply message';

			// Process original message text
			if (parentMessage.body) {
				try {
					// Try to parse as JSON (Quill Delta format)
					const parsedBody = JSON.parse(parentMessage.body);
					if (parsedBody.ops) {
						originalMessagePreview = parsedBody.ops
							.map((op: any) =>
								typeof op.insert === 'string' ? op.insert : ''
							)
							.join('')
							.trim();
					}
				} catch (e) {
					// Not JSON, use as is (might contain HTML)
					originalMessagePreview = parentMessage.body
						.replace(/<[^>]*>/g, '') // Remove HTML tags
						.trim();
				}
			}

			// Process reply message text
			if (replyMessage.body) {
				try {
					// Try to parse as JSON (Quill Delta format)
					const parsedBody = JSON.parse(replyMessage.body);
					if (parsedBody.ops) {
						replyMessagePreview = parsedBody.ops
							.map((op: any) =>
								typeof op.insert === 'string' ? op.insert : ''
							)
							.join('')
							.trim();
					}
				} catch (e) {
					// Not JSON, use as is (might contain HTML)
					replyMessagePreview = replyMessage.body
						.replace(/<[^>]*>/g, '') // Remove HTML tags
						.trim();
				}
			}

			// Send the email
			const baseUrl = process.env.SITE_URL || 'https://proddy.tech';
			const workspaceUrl = `${baseUrl}/workspace/${replyMessage.workspaceId}`;
			const apiUrl = `${baseUrl}/api/email/thread-reply`;
			console.log(
				'Sending thread reply email notification to:',
				originalAuthor.user.email
			);
			console.log('Using API URL:', apiUrl);

			try {
				const response: Response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						to: originalAuthor.user.email,
						firstName: originalAuthor.user.name || 'User',
						replierName: replier.user.name || 'A team member',
						originalMessagePreview: originalMessagePreview,
						replyMessagePreview: replyMessagePreview,
						channelName: channelName,
						workspaceUrl: workspaceUrl,
						workspaceName: 'Proddy',
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					console.error('Email API error:', errorData);
					return {
						success: false,
						error: `Email API error: ${response.status} ${response.statusText}`,
					};
				}

				const data = await response.json();
				console.log('Thread reply email sent successfully:', data);
				return { success: true };
			} catch (fetchError: unknown) {
				// If we can't reach the email API at all, log it but don't fail the whole operation
				console.error('Failed to reach email API:', fetchError);
				return {
					success: false,
					error: `Failed to reach email API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
				};
			}
		} catch (error) {
			console.error('Error sending thread reply email:', error);
			return { success: false, error: String(error) };
		}
	},
});

// Test function to create a thread reply and send an email
export const createTestThreadReplyWithEmail = action({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
	},
	handler: async (
		ctx,
		args
	): Promise<{
		success: boolean;
		parentMessageId: Id<'messages'>;
		replyMessageId: Id<'messages'>;
		emailResult: any;
	}> => {
		try {
			// Create a parent message
			const parentMemberId = await ctx.runQuery(api.members.current, {
				workspaceId: args.workspaceId,
			});

			if (!parentMemberId) {
				throw new Error('Current member not found');
			}

			// Create a parent message
			const parentMessageId: Id<'messages'> = await ctx.runMutation(
				api.messages.create,
				{
					workspaceId: args.workspaceId,
					channelId: args.channelId,
					body: 'This is a test parent message for thread reply email testing',
				}
			);

			// Create a reply message
			const replyMessageId: Id<'messages'> = await ctx.runMutation(
				api.messages.create,
				{
					workspaceId: args.workspaceId,
					channelId: args.channelId,
					parentMessageId,
					body: 'This is a test reply message for email testing',
				}
			);

			// Send the email notification
			const result: { success: boolean; error?: string; skipped?: boolean } =
				await ctx.runAction(api.threadReplies.sendThreadReplyEmail, {
					messageId: replyMessageId,
					parentMessageId,
				});

			return {
				success: true,
				parentMessageId,
				replyMessageId,
				emailResult: result,
			};
		} catch (error) {
			console.error('Error creating test thread reply with email:', error);
			throw error;
		}
	},
});
