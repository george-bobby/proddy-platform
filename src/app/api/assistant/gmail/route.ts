import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { VercelAIToolSet } from 'composio-core';
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

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 }
			);
		}

		console.log('[Gmail Assistant] Processing request:', message);

		// Fetch workspace Gmail integration
		let gmailIntegration = null;

		try {
			const integrationResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ workspaceId, service: 'gmail' }),
				}
			);

			if (integrationResponse.ok) {
				gmailIntegration = await integrationResponse.json();
			}
		} catch (error) {
			console.error(
				'[Gmail Assistant] Error fetching Gmail integration:',
				error
			);
		}

		if (!gmailIntegration) {
			return NextResponse.json({
				success: false,
				error:
					'No Gmail integration found for this workspace. Please connect Gmail in workspace settings.',
				actions: [
					{
						label: 'Connect Gmail',
						type: 'navigation',
						url: `/workspace/${workspaceId}/manage?tab=workspace`,
					},
				],
			});
		}

		// Initialize toolset with entity ID from Gmail integration
		const toolset = new VercelAIToolSet({
			apiKey: process.env.COMPOSIO_API_KEY,
		});

		// Get Gmail tools from Composio with entity ID
		const tools = await toolset.getTools(
			{
				apps: ['gmail'],
				actions: [
					'GMAIL_SEND_EMAIL',
					'GMAIL_LIST_MESSAGES',
					'GMAIL_GET_MESSAGE',
					'GMAIL_SEARCH_MESSAGES',
					'GMAIL_CREATE_DRAFT',
					'GMAIL_SEND_DRAFT',
					'GMAIL_DELETE_MESSAGE',
					'GMAIL_MARK_AS_READ',
					'GMAIL_MARK_AS_UNREAD',
					'GMAIL_ADD_LABEL',
					'GMAIL_REMOVE_LABEL',
					'GMAIL_GET_LABELS',
				],
			},
			gmailIntegration.entityId // Pass entity ID as second parameter
		);

		console.log('[Gmail Assistant] Available tools:', tools.length);

		// Create a system prompt for Gmail-specific assistance
		const systemPrompt = `You are a helpful Gmail assistant that can interact with Gmail accounts.

You have access to Gmail tools to:
- Send emails
- List and search messages
- Read message content
- Create and send drafts
- Manage labels
- Mark messages as read/unread
- Delete messages

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to send an email, use GMAIL_SEND_EMAIL with:
   - to: recipient email address
   - subject: email subject
   - body: email content (can be HTML or plain text)

2. If the user wants to search for emails, use GMAIL_SEARCH_MESSAGES with:
   - query: search query (e.g., "from:example@gmail.com", "subject:meeting")
   - max_results: number of results to return (default: 10)

3. If the user wants to list recent emails, use GMAIL_LIST_MESSAGES with:
   - max_results: number of messages to return
   - label_ids: optional array of label IDs to filter by

4. If the user wants to read a specific email, use GMAIL_GET_MESSAGE with:
   - message_id: the ID of the message to read

5. For draft management:
   - Use GMAIL_CREATE_DRAFT to create a draft
   - Use GMAIL_SEND_DRAFT to send an existing draft

6. For email organization:
   - Use GMAIL_ADD_LABEL or GMAIL_REMOVE_LABEL to manage labels
   - Use GMAIL_MARK_AS_READ or GMAIL_MARK_AS_UNREAD to change read status

When sending emails:
- Use the workspace context to provide relevant details
- Create professional and clear email content
- Include proper subject lines
- Format content appropriately

Always confirm what action you're taking and provide clear feedback about the results.`;

		// Generate response with tools using Vercel AI SDK
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			tools,
			prompt: `${systemPrompt}\n\nUser: ${message}`,
		});

		console.log('[Gmail Assistant] AI response generated');

		// Extract tool results from the result
		const toolResults = [];
		if (result.toolCalls && result.toolCalls.length > 0) {
			console.log(
				'[Gmail Assistant] Tool calls executed:',
				result.toolCalls.length
			);

			for (const toolCall of result.toolCalls) {
				toolResults.push({
					toolName: toolCall.toolName,
					args: toolCall.args,
					// Tool results are handled automatically by Vercel AI SDK
				});
				console.log('[Gmail Assistant] Tool executed:', toolCall.toolName);
			}
		}

		return NextResponse.json({
			success: true,
			response: result.text || 'Gmail action completed successfully!',
			toolCalls: result.toolCalls || [],
			toolResults,
			hasGmailAction: toolResults.length > 0,
		});
	} catch (error) {
		console.error('[Gmail Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
