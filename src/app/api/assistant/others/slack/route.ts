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

		console.log('[Slack Assistant] Processing request:', message);

		// Fetch workspace Slack integration
		let slackIntegration = null;
		
		try {
			const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ workspaceId, service: 'slack' }),
			});

			if (integrationResponse.ok) {
				slackIntegration = await integrationResponse.json();
			}
		} catch (error) {
			console.error('[Slack Assistant] Error fetching Slack integration:', error);
		}

		if (!slackIntegration) {
			return NextResponse.json({
				success: false,
				error: 'No Slack integration found for this workspace. Please connect Slack in workspace settings.',
				actions: [
					{
						label: 'Connect Slack',
						type: 'navigation',
						url: `/workspace/${workspaceId}/manage?tab=workspace`,
					},
				],
			});
		}

		// Initialize toolset with entity ID from Slack integration
		const toolset = new VercelAIToolSet({
			apiKey: process.env.COMPOSIO_API_KEY,
		});

		// Get Slack tools from Composio with entity ID
		const tools = await toolset.getTools(
			{
				apps: ['slack'],
				actions: [
					'SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL',
					'SLACK_LIST_CHANNELS',
					'SLACK_GET_CHANNEL_INFO',
					'SLACK_CREATE_CHANNEL',
					'SLACK_INVITE_USER_TO_CHANNEL',
					'SLACK_GET_USER_INFO',
					'SLACK_LIST_USERS',
				],
			},
			slackIntegration.entityId // Pass entity ID as second parameter
		);

		console.log('[Slack Assistant] Available tools:', tools.length);

		// Create a system prompt for Slack-specific assistance
		const systemPrompt = `You are a helpful Slack assistant that can interact with Slack workspaces.

You have access to Slack tools to:
- Send messages to channels
- List and get channel information
- Create new channels
- Invite users to channels
- Get user information
- List workspace users

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to send a message to a channel, use SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL with:
   - channel: channel name or ID (e.g., "#general", "C1234567890")
   - text: message content
   - as_user: true (to send as the authenticated user)

2. If the user wants to list channels, use SLACK_LIST_CHANNELS with:
   - exclude_archived: true (to exclude archived channels)
   - types: "public_channel,private_channel" (to include both types)

3. If the user wants to get channel information, use SLACK_GET_CHANNEL_INFO with:
   - channel: channel name or ID

4. If the user wants to create a channel, use SLACK_CREATE_CHANNEL with:
   - name: channel name (lowercase, no spaces)
   - is_private: false for public, true for private

5. If the user wants to invite someone to a channel, use SLACK_INVITE_USER_TO_CHANNEL with:
   - channel: channel ID
   - user: user ID

6. For user information:
   - Use SLACK_GET_USER_INFO to get details about a specific user
   - Use SLACK_LIST_USERS to list all workspace users

When sending messages:
- Use the workspace context to provide relevant details
- Format messages clearly and professionally
- Use appropriate Slack formatting (markdown, mentions, etc.)

Always confirm what action you're taking and provide clear feedback about the results.`;

		// Generate response with tools using Vercel AI SDK
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			tools,
			prompt: `${systemPrompt}\n\nUser: ${message}`,
			toolChoice: 'auto',
		});

		console.log('[Slack Assistant] AI response generated');

		// Extract tool results from the result
		const toolResults = [];
		if (result.toolCalls && result.toolCalls.length > 0) {
			console.log('[Slack Assistant] Tool calls executed:', result.toolCalls.length);

			for (const toolCall of result.toolCalls) {
				toolResults.push({
					toolName: toolCall.toolName,
					args: toolCall.args,
					// Tool results are handled automatically by Vercel AI SDK
				});
				console.log('[Slack Assistant] Tool executed:', toolCall.toolName);
			}
		}

		return NextResponse.json({
			success: true,
			response: result.text || 'Slack action completed successfully!',
			toolCalls: result.toolCalls || [],
			toolResults,
			hasSlackAction: toolResults.length > 0,
		});
	} catch (error) {
		console.error('[Slack Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
