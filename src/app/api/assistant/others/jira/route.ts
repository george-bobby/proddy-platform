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

		console.log('[Jira Assistant] Processing request:', message);

		// Fetch workspace Jira integration
		let jiraIntegration = null;
		
		try {
			const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ workspaceId, service: 'jira' }),
			});

			if (integrationResponse.ok) {
				jiraIntegration = await integrationResponse.json();
			}
		} catch (error) {
			console.error('[Jira Assistant] Error fetching Jira integration:', error);
		}

		if (!jiraIntegration) {
			return NextResponse.json({
				success: false,
				error: 'No Jira integration found for this workspace. Please connect Jira in workspace settings.',
				actions: [
					{
						label: 'Connect Jira',
						type: 'navigation',
						url: `/workspace/${workspaceId}/manage?tab=workspace`,
					},
				],
			});
		}

		// Initialize toolset with entity ID from Jira integration
		const toolset = new VercelAIToolSet({
			apiKey: process.env.COMPOSIO_API_KEY,
		});

		// Get Jira tools from Composio with entity ID
		const tools = await toolset.getTools(
			{
				apps: ['jira'],
				actions: [
					'JIRA_CREATE_ISSUE',
					'JIRA_LIST_ISSUES',
					'JIRA_GET_ISSUE',
					'JIRA_UPDATE_ISSUE',
					'JIRA_DELETE_ISSUE',
					'JIRA_ADD_COMMENT_TO_ISSUE',
					'JIRA_LIST_PROJECTS',
					'JIRA_GET_PROJECT',
				],
			},
			jiraIntegration.entityId // Pass entity ID as second parameter
		);

		console.log('[Jira Assistant] Available tools:', tools.length);

		// Create a system prompt for Jira-specific assistance
		const systemPrompt = `You are a helpful Jira assistant that can interact with Jira projects.

You have access to Jira tools to:
- Create and manage issues
- List and search issues
- Update issue details
- Add comments to issues
- Manage projects
- Get project information

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to create a Jira issue, use JIRA_CREATE_ISSUE with:
   - project: project key (e.g., "PROJ")
   - summary: issue title/summary
   - description: detailed description using workspace context
   - issuetype: issue type (e.g., "Task", "Bug", "Story")
   - priority: priority level (e.g., "High", "Medium", "Low")

2. If the user wants to list issues, use JIRA_LIST_ISSUES with:
   - jql: JQL query to filter issues (e.g., "project = PROJ")
   - maxResults: number of results to return (default: 50)

3. If the user wants to get details about a specific issue, use JIRA_GET_ISSUE with:
   - issueIdOrKey: issue ID or key (e.g., "PROJ-123")

4. If the user wants to update an issue, use JIRA_UPDATE_ISSUE with:
   - issueIdOrKey: issue ID or key
   - fields: object containing fields to update

5. If the user wants to add a comment, use JIRA_ADD_COMMENT_TO_ISSUE with:
   - issueIdOrKey: issue ID or key
   - body: comment text

6. For project management:
   - Use JIRA_LIST_PROJECTS to list all projects
   - Use JIRA_GET_PROJECT to get details about a specific project

When creating issues:
- Use the workspace context to provide relevant details
- Create clear and descriptive summaries
- Include proper descriptions with context
- Set appropriate issue types and priorities

Always confirm what action you're taking and provide clear feedback about the results.`;

		// Generate response with tools using Vercel AI SDK
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			tools,
			prompt: `${systemPrompt}\n\nUser: ${message}`,
			toolChoice: 'auto',
		});

		console.log('[Jira Assistant] AI response generated');

		// Extract tool results from the result
		const toolResults = [];
		if (result.toolCalls && result.toolCalls.length > 0) {
			console.log('[Jira Assistant] Tool calls executed:', result.toolCalls.length);

			for (const toolCall of result.toolCalls) {
				toolResults.push({
					toolName: toolCall.toolName,
					args: toolCall.args,
					// Tool results are handled automatically by Vercel AI SDK
				});
				console.log('[Jira Assistant] Tool executed:', toolCall.toolName);
			}
		}

		return NextResponse.json({
			success: true,
			response: result.text || 'Jira action completed successfully!',
			toolCalls: result.toolCalls || [],
			toolResults,
			hasJiraAction: toolResults.length > 0,
		});
	} catch (error) {
		console.error('[Jira Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
