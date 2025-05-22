import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

// Load environment variables
dotenv.config();

export async function POST(req: NextRequest) {
	try {
		// Check if API key is configured
		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			console.error(
				'Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable'
			);
			return NextResponse.json(
				{
					response:
						"I'm having trouble connecting to the AI service. Please check your API configuration.",
					error: 'API key not configured',
				},
				{ status: 500 }
			);
		}

		const { message } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		// We only support RAG mode now - all requests are treated as RAG

		try {
			console.log('Calling Gemini API with model: gpt-4-turbo');

			const { text } = await generateText({
				model: google('gemini-2.0-flash-exp'),
				messages: [{ role: 'user', content: message }], // Message is a complete prompt with context
				temperature: 0.7,
				maxTokens: 800,
			});

			console.log('Gemini API response received successfully');
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
