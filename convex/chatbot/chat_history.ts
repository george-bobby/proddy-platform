import { mutation, query, QueryCtx } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

// Define types for chat messages and responses
export type Source = {
	id: string;
	type: string;
	text: string;
};

export type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	sources?: Source[];
	actions?: NavigationAction[];
};

export type ChatHistory = {
	messages: ChatMessage[];
};

export type NavigationAction = {
	label: string;
	type: string;
	url: string;
	noteId?: string;
	channelId?: string;
};

// Get the current member for a workspace
export async function getCurrentMember(
	ctx: QueryCtx,
	workspaceId: Id<'workspaces'>
) {
	const userId = await getAuthUserId(ctx);
	if (!userId) throw new Error('Unauthorized');

	const member = await ctx.db
		.query('members')
		.withIndex('by_workspace_id_user_id', (q) =>
			q.eq('workspaceId', workspaceId).eq('userId', userId)
		)
		.unique();

	if (!member) throw new Error('Not a member of this workspace');
	return member;
}

// Get chat history for the current user in a workspace
export const getChatHistory = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args): Promise<ChatHistory> => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const chatHistory = await ctx.db
			.query('chatHistory')
			.withIndex('by_workspace_id_member_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
			)
			.first();

		if (!chatHistory) {
			// Return empty history if none exists
			return {
				messages: [],
			};
		}

		return {
			messages: chatHistory.messages,
		};
	},
});

// Add a message to chat history with retry logic for race conditions
export const addMessage = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		content: v.string(),
		role: v.union(v.literal('user'), v.literal('assistant')),
		sources: v.optional(
			v.array(
				v.object({
					id: v.string(),
					type: v.string(),
					text: v.string(),
				})
			)
		),
		actions: v.optional(
			v.array(
				v.object({
					label: v.string(),
					type: v.string(),
					url: v.string(),
					noteId: v.optional(v.string()),
					channelId: v.optional(v.string()),
				})
			)
		),
	},
	handler: async (ctx, args) => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const timestamp = Date.now();
		const newMessage: ChatMessage = {
			role: args.role,
			content: args.content,
			timestamp,
			sources: args.sources,
			actions: args.actions,
		};

		// Retry logic to handle race conditions
		const maxRetries = 3;
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				// Fresh query each time to get the latest state
				const chatHistory = await ctx.db
					.query('chatHistory')
					.withIndex('by_workspace_id_member_id', (q) =>
						q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
					)
					.first();

				if (chatHistory) {
					// Update existing chat history
					return await ctx.db.patch(chatHistory._id, {
						messages: [...chatHistory.messages, newMessage],
						updatedAt: timestamp,
					});
				} else {
					// Create new chat history
					return await ctx.db.insert('chatHistory', {
						workspaceId: args.workspaceId,
						memberId: member._id,
						messages: [newMessage],
						updatedAt: timestamp,
					});
				}
			} catch (error) {
				// If this is the last attempt, throw the error
				if (attempt === maxRetries - 1) {
					console.error(
						`Failed to add message after ${maxRetries} attempts:`,
						error
					);
					throw error;
				}

				// Wait a small random amount before retrying to reduce collision probability
				await new Promise((resolve) =>
					setTimeout(resolve, Math.random() * 100 + 50)
				);
			}
		}

		// This should never be reached, but TypeScript requires a return
		throw new Error('Failed to add message after all retry attempts');
	},
});

// Clear chat history with retry logic for race conditions
export const clearChatHistory = mutation({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const timestamp = Date.now();
		const welcomeMessage = {
			role: 'assistant' as const,
			content: "Hello! I'm your workspace assistant. How can I help you today?",
			timestamp,
		};

		// Retry logic to handle race conditions
		const maxRetries = 3;
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				// Fresh query each time to get the latest state
				const chatHistory = await ctx.db
					.query('chatHistory')
					.withIndex('by_workspace_id_member_id', (q) =>
						q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
					)
					.first();

				if (chatHistory) {
					// Reset to just the welcome message
					return await ctx.db.patch(chatHistory._id, {
						messages: [welcomeMessage],
						updatedAt: timestamp,
					});
				}

				// If no history exists, do nothing
				return null;
			} catch (error) {
				// If this is the last attempt, throw the error
				if (attempt === maxRetries - 1) {
					console.error(
						`Failed to clear chat history after ${maxRetries} attempts:`,
						error
					);
					throw error;
				}

				// Wait a small random amount before retrying
				await new Promise((resolve) =>
					setTimeout(resolve, Math.random() * 100 + 50)
				);
			}
		}

		// This should never be reached, but TypeScript requires a return
		return null;
	},
});
