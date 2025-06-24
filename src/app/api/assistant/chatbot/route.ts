import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext, workspaceId } = await req.json();

		if (!message || !workspaceId) {
			return NextResponse.json(
				{ error: 'Message and workspaceId are required' },
				{ status: 400 }
			);
		}

		console.log('[Chatbot Assistant] Processing request:', message);

		// Search for relevant workspace content to provide context
		const searchResults = await convex.query(api.search.searchAll, {
			workspaceId,
			query: message,
			limit: 10,
		});

		console.log(
			'[Chatbot Assistant] Found',
			searchResults.length,
			'search results'
		);

		// Prepare enhanced workspace context with search results
		const enhancedContext = `
${workspaceContext || ''}

RELEVANT WORKSPACE CONTENT:
${searchResults
	.map(
		(result, index) => `
${index + 1}. [${result.type.toUpperCase()}] ${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}
`
	)
	.join('\n')}
		`.trim();

		// Create a comprehensive system prompt for workspace assistance
		const systemPrompt = `You are a helpful workspace assistant for Proddy, a team collaboration platform.
You can help users with information about their workspace, tasks, messages, notes, calendar events, and other features.

IMPORTANT INSTRUCTIONS:
1. You must ONLY answer based on the workspace context and relevant content provided below
2. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace."
3. Do NOT use your general knowledge to answer questions
4. Be concise, friendly, and helpful
5. When referencing specific content, mention the source type (e.g., "According to your notes..." or "Based on your tasks...")
6. Use emojis appropriately to make responses more engaging
7. If you find multiple relevant items, organize them clearly with bullet points or numbered lists

WORKSPACE CONTEXT AND RELEVANT CONTENT:
${enhancedContext}

User's question: ${message}

Remember: Only answer based on the workspace context provided. If the context doesn't contain relevant information, say "I don't have information about that in your workspace."`;

		// Generate response using OpenAI
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: message,
				},
			],
			temperature: 0.7,
			maxTokens: 800,
		});

		console.log('[Chatbot Assistant] Response generated');

		// Prepare sources for the response
		const sources = searchResults.map((result) => ({
			id: result._id,
			type: result.type,
			text:
				result.text.substring(0, 100) + (result.text.length > 100 ? '...' : ''),
		}));

		// Generate navigation actions based on search results
		const actions = [];

		// Check for calendar/meeting related content
		if (
			searchResults.some(
				(result) =>
					result.type === 'event' ||
					result.text.toLowerCase().includes('meeting') ||
					result.text.toLowerCase().includes('calendar')
			)
		) {
			actions.push({
				label: 'View Calendar',
				type: 'calendar',
				url: '/workspace/[workspaceId]/calendar',
			});
		}

		// Check for notes content
		const notesResults = searchResults.filter(
			(result) => result.type === 'note'
		);
		if (notesResults.length > 0) {
			const firstNote = notesResults[0];
			const channelId = (firstNote as any).channelId;
			if (channelId) {
				actions.push({
					label: 'View Note',
					type: 'note',
					url: `/workspace/[workspaceId]/channel/[channelId]/notes?noteId=[noteId]`,
					noteId: firstNote._id.toString(),
					channelId: channelId.toString(),
				});
			}
		}

		// Check for board cards content
		const cardResults = searchResults.filter(
			(result) => result.type === 'card'
		);
		if (cardResults.length > 0) {
			const firstCard = cardResults[0];
			const channelId = (firstCard as any).channelId;
			if (channelId) {
				actions.push({
					label: 'View Board',
					type: 'board',
					url: `/workspace/[workspaceId]/channel/[channelId]/board`,
					channelId: channelId.toString(),
				});
			}
		}

		// Check for task content
		if (searchResults.some((result) => result.type === 'task')) {
			actions.push({
				label: 'View Tasks',
				type: 'task',
				url: '/workspace/[workspaceId]/tasks',
			});
		}

		// Check for message content
		if (searchResults.some((result) => result.type === 'message')) {
			actions.push({
				label: 'View Chats',
				type: 'message',
				url: '/workspace/[workspaceId]/chats',
			});
		}

		return NextResponse.json({
			success: true,
			response: result.text,
			sources,
			actions,
			assistantType: 'chatbot',
		});
	} catch (error) {
		console.error('[Chatbot Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
