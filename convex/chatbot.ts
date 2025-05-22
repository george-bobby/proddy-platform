import { action, mutation, query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

// Define types for chat messages and responses
type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
};

type ChatHistory = {
	messages: ChatMessage[];
};

type GenerateResponseResult = {
	response: string;
	sources?: Array<{
		id: Id<any>;
		type: string;
		text: string;
	}>;
	error?: string;
};

// Get the current member for a workspace
async function getCurrentMember(ctx: QueryCtx, workspaceId: Id<'workspaces'>) {
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

// Add a message to chat history
export const addMessage = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		content: v.string(),
		role: v.union(v.literal('user'), v.literal('assistant')),
	},
	handler: async (ctx, args) => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const chatHistory = await ctx.db
			.query('chatHistory')
			.withIndex('by_workspace_id_member_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
			)
			.first();

		const timestamp = Date.now();
		const newMessage: ChatMessage = {
			role: args.role,
			content: args.content,
			timestamp,
		};

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
	},
});

// Clear chat history
export const clearChatHistory = mutation({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const chatHistory = await ctx.db
			.query('chatHistory')
			.withIndex('by_workspace_id_member_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
			)
			.first();

		if (chatHistory) {
			// Reset to just the welcome message
			const timestamp = Date.now();
			return await ctx.db.patch(chatHistory._id, {
				messages: [
					{
						role: 'assistant',
						content:
							"Hello! I'm your workspace assistant. How can I help you today?",
						timestamp,
					},
				],
				updatedAt: timestamp,
			});
		}

		// If no history exists, do nothing
		return null;
	},
});

// Generate a response using RAG
export const generateResponse = action({
	args: {
		workspaceId: v.id('workspaces'),
		message: v.string(),
	},
	handler: async (ctx, args): Promise<GenerateResponseResult> => {
		try {
			// 1. Search for relevant content
			const searchResults = await ctx.runQuery(api.search.searchAll, {
				workspaceId: args.workspaceId,
				query: args.message,
				limit: 5,
			});

			// 2. Get workspace info
			const workspace = await ctx.runQuery(api.workspaces.getById, {
				id: args.workspaceId,
			});

			// 3. Get chat history
			const chatHistory = await ctx.runQuery(api.chatbot.getChatHistory, {
				workspaceId: args.workspaceId,
			});

			// 4. Prepare context from search results
			const context = searchResults
				.map((result) => {
					return `[${result.type.toUpperCase()}] ${result.text}`;
				})
				.join('\n\n');

			// 5. Prepare conversation history (last 5 messages)
			const recentMessages = chatHistory.messages.slice(-5);
			const conversationHistory = recentMessages
				.map((msg) => {
					return `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
				})
				.join('\n');

			// 6. Construct the prompt
			const prompt = `You are a helpful workspace assistant for ${workspace?.name || 'Proddy'}, a team collaboration platform.
You can help users with information about their workspace, tasks, messages, and other features.
Be concise, friendly, and helpful. If you don't know something, be honest about it.

Here is some context from the workspace that might be relevant to the user's question:
${context || 'No specific context found for this query.'}

Recent conversation history:
${conversationHistory || 'This is a new conversation.'}

User's question: ${args.message}

Please provide a helpful response based on the context provided. If the context doesn't contain relevant information, provide general guidance based on your knowledge of collaboration platforms.`;

			// 7. Add user message to history
			await ctx.runMutation(api.chatbot.addMessage, {
				workspaceId: args.workspaceId,
				content: args.message,
				role: 'user',
			});

			// 8. Generate response using the Next.js API route
			// This is a temporary solution until we implement OpenAI directly in Convex
			// Use relative URL for local development and absolute URL as fallback
			const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy.tech';
			const apiUrl = baseUrl.startsWith('http')
				? `${baseUrl}/api/assistant`
				: '/api/assistant';

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: prompt,
					isRag: true,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to generate response');
			}

			const data = await response.json();
			const assistantResponse =
				data.response ||
				"I'm sorry, I couldn't process your request at the moment.";

			// 9. Add assistant response to history
			await ctx.runMutation(api.chatbot.addMessage, {
				workspaceId: args.workspaceId,
				content: assistantResponse,
				role: 'assistant',
			});

			// 10. Return the response
			return {
				response: assistantResponse,
				sources: searchResults.map((result) => ({
					id: result._id,
					type: result.type,
					text:
						result.text.substring(0, 100) +
						(result.text.length > 100 ? '...' : ''),
				})),
			};
		} catch (error) {
			console.error('Error generating response:', error);
			return {
				response:
					"I'm having trouble processing your request right now. Please try again later.",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},
});
