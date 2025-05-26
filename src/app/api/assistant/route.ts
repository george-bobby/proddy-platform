import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Schema for validating assistant API requests
 */
const AssistantRequestSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty'),
});

type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

/**
 * Handles POST requests to the assistant API
 *
 * This endpoint processes user messages and returns AI-generated responses
 * using OpenAI's models. It includes proper error handling, request validation,
 * and performance monitoring.
 */
export async function POST(req: NextRequest) {
	// Start timing the request
	const startTime = performance.now();

	try {
		// Check if Google Generative AI API key is configured
		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			console.error(
				'[Assistant API] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable'
			);
			return NextResponse.json(
				{
					response:
						"I'm having trouble connecting to the AI service. Please check your API configuration.",
					error: 'API key not configured',
					success: false,
				},
				{
					status: 500,
					headers: {
						'Cache-Control':
							'no-store, no-cache, must-revalidate, proxy-revalidate',
						'Pragma': 'no-cache',
					},
				}
			);
		}

		// Parse and validate request body
		let requestData: AssistantRequest;
		try {
			const body = await req.json();
			requestData = AssistantRequestSchema.parse(body);
		} catch (parseError) {
			console.error('[Assistant API] Request validation error:', parseError);
			return NextResponse.json(
				{
					error:
						parseError instanceof z.ZodError
							? parseError.errors
									.map((e) => `${e.path}: ${e.message}`)
									.join(', ')
							: 'Invalid request format',
					success: false,
				},
				{ status: 400 }
			);
		}

		// Extract the message from validated request
		const { message } = requestData;

		try {
			console.log(
				'[Assistant API] Processing request with Google Generative AI'
			);

			const { text } = await generateText({
				model: google('gemini-1.5-pro'),
				messages: [{ role: 'user', content: message }],
				temperature: 0.7,
				maxTokens: 800,
			});

			// Calculate response time
			const responseTime = Math.round(performance.now() - startTime);
			console.log(
				`[Assistant API] Google Generative AI response received successfully (${responseTime}ms)`
			);

			return NextResponse.json({
				response: text,
				success: true,
				processingTime: responseTime,
			});
		} catch (aiError) {
			// Calculate error response time
			const errorTime = Math.round(performance.now() - startTime);

			console.error(
				'[Assistant API] Error calling Google Generative AI:',
				aiError
			);
			console.error(
				'[Assistant API] Error details:',
				aiError instanceof Error
					? {
							name: aiError.name,
							message: aiError.message,
							stack:
								process.env.NODE_ENV === 'development'
									? aiError.stack
									: undefined,
						}
					: 'Unknown error'
			);

			// Return a fallback response with detailed error info
			return NextResponse.json(
				{
					response:
						"I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.",
					error: `AI API error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
					success: false,
					processingTime: errorTime,
				},
				{
					status: 503, // Service Unavailable
					headers: {
						'Retry-After': '60', // Suggest client retry after 60 seconds
					},
				}
			);
		}
	} catch (error) {
		// Calculate total error time
		const totalErrorTime = Math.round(performance.now() - startTime);

		console.error('[Assistant API] Unhandled error:', error);
		console.error(
			'[Assistant API] Error details:',
			error instanceof Error
				? {
						name: error.name,
						message: error.message,
						stack:
							process.env.NODE_ENV === 'development' ? error.stack : undefined,
					}
				: 'Unknown error'
		);

		return NextResponse.json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error',
				success: false,
				processingTime: totalErrorTime,
			},
			{ status: 500 }
		);
	}
}
