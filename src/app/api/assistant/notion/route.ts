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

		console.log('[Notion Assistant] Processing request:', message);

		// Fetch workspace Notion integration
		let notionIntegration = null;
		
		try {
			const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ workspaceId, service: 'notion' }),
			});

			if (integrationResponse.ok) {
				notionIntegration = await integrationResponse.json();
			}
		} catch (error) {
			console.error('[Notion Assistant] Error fetching Notion integration:', error);
		}

		if (!notionIntegration) {
			return NextResponse.json({
				success: false,
				error: 'No Notion integration found for this workspace. Please connect Notion in workspace settings.',
				actions: [
					{
						label: 'Connect Notion',
						type: 'navigation',
						url: `/workspace/${workspaceId}/manage?tab=workspace`,
					},
				],
			});
		}

		// Initialize toolset with entity ID from Notion integration
		const toolset = new VercelAIToolSet({
			apiKey: process.env.COMPOSIO_API_KEY,
		});

		// Get Notion tools from Composio with entity ID
		const tools = await toolset.getTools(
			{
				apps: ['notion'],
				actions: [
					'NOTION_CREATE_PAGE',
					'NOTION_LIST_PAGES',
					'NOTION_GET_PAGE',
					'NOTION_UPDATE_PAGE',
					'NOTION_DELETE_PAGE',
					'NOTION_CREATE_DATABASE',
					'NOTION_QUERY_DATABASE',
					'NOTION_GET_DATABASE',
				],
			},
			notionIntegration.entityId // Pass entity ID as second parameter
		);

		console.log('[Notion Assistant] Available tools:', tools.length);

		// Create a system prompt for Notion-specific assistance
		const systemPrompt = `You are a helpful Notion assistant that can interact with Notion workspaces.

You have access to Notion tools to:
- Create and manage pages
- List and search pages
- Update page content
- Create and manage databases
- Query database entries
- Get database information

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to create a Notion page, use NOTION_CREATE_PAGE with:
   - parent: parent page or database ID
   - properties: page properties (title, etc.)
   - children: page content blocks

2. If the user wants to list pages, use NOTION_LIST_PAGES with:
   - page_size: number of pages to return (default: 100)

3. If the user wants to get details about a specific page, use NOTION_GET_PAGE with:
   - page_id: the ID of the page to retrieve

4. If the user wants to update a page, use NOTION_UPDATE_PAGE with:
   - page_id: page ID to update
   - properties: updated properties
   - archived: true/false to archive/unarchive

5. If the user wants to create a database, use NOTION_CREATE_DATABASE with:
   - parent: parent page ID
   - title: database title
   - properties: database schema

6. For database operations:
   - Use NOTION_QUERY_DATABASE to search and filter database entries
   - Use NOTION_GET_DATABASE to get database schema and information

When creating pages:
- Use the workspace context to provide relevant content
- Create clear and well-structured pages
- Include appropriate titles and formatting
- Organize content logically

When working with databases:
- Define clear schemas with appropriate property types
- Use filters and sorts for efficient querying
- Maintain consistent data structure

Always confirm what action you're taking and provide clear feedback about the results.`;

		// Generate response with tools using Vercel AI SDK
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			tools,
			prompt: `${systemPrompt}\n\nUser: ${message}`,
			toolChoice: 'auto',
		});

		console.log('[Notion Assistant] AI response generated');

		// Extract tool results from the result
		const toolResults = [];
		if (result.toolCalls && result.toolCalls.length > 0) {
			console.log('[Notion Assistant] Tool calls executed:', result.toolCalls.length);

			for (const toolCall of result.toolCalls) {
				toolResults.push({
					toolName: toolCall.toolName,
					args: toolCall.args,
					// Tool results are handled automatically by Vercel AI SDK
				});
				console.log('[Notion Assistant] Tool executed:', toolCall.toolName);
			}
		}

		return NextResponse.json({
			success: true,
			response: result.text || 'Notion action completed successfully!',
			toolCalls: result.toolCalls || [],
			toolResults,
			hasNotionAction: toolResults.length > 0,
		});
	} catch (error) {
		console.error('[Notion Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
