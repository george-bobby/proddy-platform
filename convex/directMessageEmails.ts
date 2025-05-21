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

// Action to send email notification for direct messages
export const sendDirectMessageEmail = action({
	args: {
		messageId: v.id('messages'),
	},
	handler: async (ctx, { messageId }: { messageId: Id<'messages'> }) => {
		try {
			// Get the message
			const message = await ctx.runQuery(api.messages._getMessageById, {
				messageId,
			});
			if (!message) {
				console.error('Message not found:', messageId);
				return { success: false, error: 'Message not found' };
			}

			// Ensure this is a direct message (has conversationId)
			if (!message.conversationId) {
				console.error('Not a direct message (no conversationId):', messageId);
				return { success: false, error: 'Not a direct message' };
			}

			// Get the conversation
			const conversation = await ctx.runQuery(
				api.conversations._getConversationById,
				{
					conversationId: message.conversationId,
				}
			);
			if (!conversation) {
				console.error('Conversation not found:', message.conversationId);
				return { success: false, error: 'Conversation not found' };
			}

			// Get the sender (author of the message)
			const sender = await ctx.runQuery(api.members._getMemberById, {
				memberId: message.memberId,
			});
			if (!sender || !sender.user) {
				console.error('Sender not found:', message.memberId);
				return { success: false, error: 'Sender not found' };
			}

			// Determine the recipient (the other member in the conversation)
			const recipientId =
				conversation.memberOneId === message.memberId
					? conversation.memberTwoId
					: conversation.memberOneId;

			// Get the recipient
			const recipient = await ctx.runQuery(api.members._getMemberById, {
				memberId: recipientId,
			});
			if (!recipient || !recipient.user) {
				console.error('Recipient not found:', recipientId);
				return { success: false, error: 'Recipient not found' };
			}

			// Check if the message has already been read
			const isRead = await ctx.runQuery(api.direct._isDirectMessageRead, {
				messageId,
				memberId: recipientId,
			});

			// Don't send email if the message has already been read
			if (isRead) {
				console.log('Skipping email notification: Message already read');
				return { success: true, skipped: true };
			}

			// Extract message preview
			let messagePreview = 'You have a new direct message';
			if (message.body) {
				try {
					// Try to parse as JSON (Quill Delta format)
					const parsedBody = JSON.parse(message.body);
					if (parsedBody.ops) {
						messagePreview = parsedBody.ops
							.map((op: any) =>
								typeof op.insert === 'string' ? op.insert : ''
							)
							.join('')
							.trim();
					}
				} catch (e) {
					// Not JSON, use as is (might contain HTML)
					messagePreview = message.body
						.replace(/<[^>]*>/g, '') // Remove HTML tags
						.trim();
				}
			}

			// Get the workspace URL (fallback to default)
			const workspaceUrl = `https://proddy-platform.vercel.app/workspace/${message.workspaceId}`;

			// Send the email
			const baseUrl = 'https://proddy-platform.vercel.app';
			const apiUrl = `${baseUrl}/api/email/direct-message`;
			console.log(
				'Sending direct message email notification to:',
				recipient.user.email
			);
			console.log('Using API URL:', apiUrl);

			try {
				const response: Response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						to: recipient.user.email,
						firstName: recipient.user.name || 'User',
						senderName: sender.user.name || 'A team member',
						messagePreview: messagePreview,
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
				console.log('Direct message email sent successfully:', data);
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
			console.error('Error sending direct message email:', error);
			return { success: false, error: String(error) };
		}
	},
});

// Test function to create a direct message and send an email
export const createTestDirectMessageWithEmail = action({
	args: {
		workspaceId: v.id('workspaces'),
		recipientMemberId: v.id('members'),
	},
	handler: async (
		ctx,
		args
	): Promise<{
		success: boolean;
		conversationId: Id<'conversations'>;
		messageId: Id<'messages'>;
		emailResult: any;
	}> => {
		try {
			// Get the current user's member ID
			const senderMemberId = await ctx.runQuery(api.members.current, {
				workspaceId: args.workspaceId,
			});

			if (!senderMemberId) {
				throw new Error('Current member not found');
			}

			// Create or get a conversation between the sender and recipient
			const conversationId: Id<'conversations'> = await ctx.runMutation(
				api.conversations.createOrGet,
				{
					workspaceId: args.workspaceId,
					memberId: args.recipientMemberId,
				}
			);

			// Create a direct message
			const messageId: Id<'messages'> = await ctx.runMutation(
				api.messages.create,
				{
					workspaceId: args.workspaceId,
					conversationId,
					body: 'This is a test direct message for email testing',
				}
			);

			// Send the email notification
			const result: { success: boolean; error?: string; skipped?: boolean } =
				await ctx.runAction(api.directMessageEmails.sendDirectMessageEmail, {
					messageId,
				});

			return {
				success: true,
				conversationId,
				messageId,
				emailResult: result,
			};
		} catch (error) {
			console.error('Error creating test direct message with email:', error);
			throw error;
		}
	},
});
