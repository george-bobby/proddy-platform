import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext, ...otherData } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		const assistantTypes = [
			'github',
			'gmail',
			'slack',
			'jira',
			'notion',
			'clickup',
			'chatbot',
			'calendar',
			'notes',
			'tasks',
			'board',
			'chats',
		];

		const systemPrompt = `You are an intent classification AI for a workspace assistant platform. Your job is to classify the user's message into one of the following assistant types: ${assistantTypes.join(', ')}.\n\nReply ONLY with the type (one word, lowercase, no extra text).\n\nUser message: ${message}`;

		const result = await generateText({
			model: openai('gpt-4o-mini'),
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: message },
			],
			temperature: 0,
			maxTokens: 10,
		});

		const predictedType = result.text.trim().toLowerCase();

		if (!assistantTypes.includes(predictedType)) {
			return NextResponse.json(
				{
					error: `Could not classify message to a valid assistant type.`,
					availableTypes: assistantTypes,
					llmOutput: result.text,
				},
				{ status: 400 }
			);
		}

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
		const targetUrl = `${baseUrl}/api/assistant/${predictedType === 'github' ? 'old-github' : predictedType}`;

		const response = await fetch(targetUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				workspaceContext,
				...otherData,
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Assistant module error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		return NextResponse.json({
			...data,
			assistantType: predictedType,
			handledBy: targetUrl.split('/').pop(),
		});
	} catch (error) {
		console.error('[Assistant Router] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				assistantType: 'router',
			},
			{ status: 500 }
		);
	}
}
