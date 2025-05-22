import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

// Load environment variables
dotenv.config();

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceId, userId, isRag } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		// If this is a RAG request, the message is already a complete prompt
		const systemPrompt = isRag
			? ''
			: `You are a helpful workspace assistant for Proddy, a team collaboration platform.
You can help users with information about their workspace, tasks, messages, and other features.
Be concise, friendly, and helpful. If you don't know something, be honest about it.
The current workspace ID is: ${workspaceId || 'unknown'}
The current user ID is: ${userId || 'unknown'}

Some things you can help with:
- Explaining how to use Proddy features
- Providing tips for better collaboration
- Answering questions about the platform
- Suggesting ways to organize tasks and channels
- Explaining how to use the AI features in Proddy

Always be professional and focus on helping the user be more productive.`;

		try {
			const { text } = await generateText({
				model: google('gemini-1.5-pro'),
				messages: isRag
					? [{ role: 'user', content: message }] // For RAG, the message is already a complete prompt
					: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: message },
						],
				temperature: 0.7,
				maxTokens: 800,
			});

			return NextResponse.json({ response: text });
		} catch (aiError) {
			console.error('Error calling Gemini API:', aiError);

			// Return a fallback response
			return NextResponse.json({
				response:
					"I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.",
				error: `AI API error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
			});
		}
	} catch (error) {
		console.error('Error in dashboard assistant route:', error);
		return NextResponse.json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
