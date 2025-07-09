import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext, workspaceId } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		console.log('[Assistant Router] Processing request:', message);

		// Check if this is an external integration request
		const externalIntegrations = ['github', 'gmail', 'slack', 'jira', 'notion', 'clickup'];
		const lowerMessage = message.toLowerCase();

		for (const integration of externalIntegrations) {
			if (lowerMessage.includes(integration)) {
				console.log(`[Assistant Router] Routing to ${integration} integration`);
				const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
				const targetUrl = `${baseUrl}/api/assistant/${integration}`;

				const response = await fetch(targetUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						message,
						workspaceContext,
						workspaceId,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					return NextResponse.json(data);
				}
			}
		}

		// Route all workspace content queries to chatbot
		console.log('[Assistant Router] Routing to chatbot for workspace content');
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
		const targetUrl = `${baseUrl}/api/assistant/chatbot`;

		const response = await fetch(targetUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				workspaceContext,
				workspaceId,
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Chatbot assistant error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();
		return NextResponse.json(data);

	} catch (error) {
		console.error('[Assistant Router] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
