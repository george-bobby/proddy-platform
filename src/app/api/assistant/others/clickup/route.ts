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

		console.log('[ClickUp Assistant] Processing request:', message);

		// Fetch workspace ClickUp integration
		let clickupIntegration = null;
		
		try {
			const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ workspaceId, service: 'clickup' }),
			});

			if (integrationResponse.ok) {
				clickupIntegration = await integrationResponse.json();
			}
		} catch (error) {
			console.error('[ClickUp Assistant] Error fetching ClickUp integration:', error);
		}

		if (!clickupIntegration) {
			return NextResponse.json({
				success: false,
				error: 'No ClickUp integration found for this workspace. Please connect ClickUp in workspace settings.',
				actions: [
					{
						label: 'Connect ClickUp',
						type: 'navigation',
						url: `/workspace/${workspaceId}/manage?tab=workspace`,
					},
				],
			});
		}

		// Initialize toolset with entity ID from ClickUp integration
		const toolset = new VercelAIToolSet({
			apiKey: process.env.COMPOSIO_API_KEY,
		});

		// Get ClickUp tools from Composio with entity ID
		const tools = await toolset.getTools(
			{
				apps: ['clickup'],
				actions: [
					'CLICKUP_CREATE_TASK',
					'CLICKUP_LIST_TASKS',
					'CLICKUP_GET_TASK',
					'CLICKUP_UPDATE_TASK',
					'CLICKUP_DELETE_TASK',
					'CLICKUP_ADD_TASK_COMMENT',
					'CLICKUP_LIST_SPACES',
					'CLICKUP_GET_SPACE',
					'CLICKUP_LIST_FOLDERS',
					'CLICKUP_LIST_LISTS',
				],
			},
			clickupIntegration.entityId // Pass entity ID as second parameter
		);

		console.log('[ClickUp Assistant] Available tools:', tools.length);

		// Create a system prompt for ClickUp-specific assistance
		const systemPrompt = `You are a helpful ClickUp assistant that can interact with ClickUp workspaces.

You have access to ClickUp tools to:
- Create and manage tasks
- List and search tasks
- Update task details
- Add comments to tasks
- Manage spaces, folders, and lists
- Get workspace information

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to create a ClickUp task, use CLICKUP_CREATE_TASK with:
   - list_id: list ID where the task should be created
   - name: task name/title
   - description: detailed description using workspace context
   - status: task status (e.g., "to do", "in progress", "complete")
   - priority: priority level (1=urgent, 2=high, 3=normal, 4=low)
   - due_date: due date timestamp (optional)

2. If the user wants to list tasks, use CLICKUP_LIST_TASKS with:
   - list_id: list ID to get tasks from
   - archived: false (to exclude archived tasks)
   - page: page number for pagination

3. If the user wants to get details about a specific task, use CLICKUP_GET_TASK with:
   - task_id: the ID of the task to retrieve

4. If the user wants to update a task, use CLICKUP_UPDATE_TASK with:
   - task_id: task ID to update
   - name: updated task name (optional)
   - description: updated description (optional)
   - status: updated status (optional)
   - priority: updated priority (optional)

5. If the user wants to add a comment, use CLICKUP_ADD_TASK_COMMENT with:
   - task_id: task ID
   - comment_text: comment content

6. For workspace navigation:
   - Use CLICKUP_LIST_SPACES to list all spaces
   - Use CLICKUP_GET_SPACE to get details about a specific space
   - Use CLICKUP_LIST_FOLDERS to list folders in a space
   - Use CLICKUP_LIST_LISTS to list lists in a folder

When creating tasks:
- Use the workspace context to provide relevant details
- Create clear and actionable task names
- Include proper descriptions with context
- Set appropriate priorities and statuses

Always confirm what action you're taking and provide clear feedback about the results.`;

		// Generate response with tools using Vercel AI SDK
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			tools,
			prompt: `${systemPrompt}\n\nUser: ${message}`,
			toolChoice: 'auto',
		});

		console.log('[ClickUp Assistant] AI response generated');

		// Extract tool results from the result
		const toolResults = [];
		if (result.toolCalls && result.toolCalls.length > 0) {
			console.log('[ClickUp Assistant] Tool calls executed:', result.toolCalls.length);

			for (const toolCall of result.toolCalls) {
				toolResults.push({
					toolName: toolCall.toolName,
					args: toolCall.args,
					// Tool results are handled automatically by Vercel AI SDK
				});
				console.log('[ClickUp Assistant] Tool executed:', toolCall.toolName);
			}
		}

		return NextResponse.json({
			success: true,
			response: result.text || 'ClickUp action completed successfully!',
			toolCalls: result.toolCalls || [],
			toolResults,
			hasClickUpAction: toolResults.length > 0,
		});
	} catch (error) {
		console.error('[ClickUp Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
