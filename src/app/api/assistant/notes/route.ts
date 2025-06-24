import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		console.log('[Notes Assistant] Processing request:', message);

		// Create a system prompt for notes-specific assistance
		const systemPrompt = `You are a helpful notes assistant for Proddy workspace.
You specialize in helping users with notes, documentation, and knowledge management.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the workspace context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace notes." Do NOT use your general knowledge to answer questions.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

User's question: ${message}

INSTRUCTIONS FOR NOTES QUERIES:
1. When presenting notes information, use clear formatting with headers and bullet points
2. Include note titles, creation dates, and relevant excerpts
3. Organize information logically by relevance or date
4. Suggest related notes when appropriate
5. Use emojis to make responses more engaging:
   - 📝 for notes
   - 🔍 for search results
   - 💡 for insights or key points
   - 📅 for dates
   - 👤 for authors

Remember: Only answer based on the workspace context provided. If the context doesn't contain relevant notes information, say "I don't have information about that in your workspace notes."`;

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

		console.log('[Notes Assistant] Response generated');

		return NextResponse.json({
			success: true,
			response: result.text,
			sources: [], // This would be populated by the main chatbot logic
			assistantType: 'notes',
			actions: [
				{
					label: 'View Notes',
					type: 'note',
					url: '/workspace/[workspaceId]/notes',
				},
			],
		});
	} catch (error) {
		console.error('[Notes Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
