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

		console.log('[GitHub Assistant] Processing request:', message);

		// Fetch workspace GitHub integration
		let githubIntegration = null;

		try {
			const integrationResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ workspaceId, service: 'github' }),
				}
			);

			if (integrationResponse.ok) {
				githubIntegration = await integrationResponse.json();
			}
		} catch (error) {
			console.error(
				'[GitHub Assistant] Error fetching GitHub integration:',
				error
			);
		}

		if (!githubIntegration) {
			return NextResponse.json({
				success: false,
				error:
					'No GitHub integration found for this workspace. Please connect GitHub in workspace settings.',
				actions: [
					{
						label: 'Connect GitHub',
						type: 'navigation',
						url: `/workspace/${workspaceId}/manage?tab=workspace`,
					},
				],
			});
		}

		// Use integration data
		const entityId = githubIntegration.entityId;
		const repositoryInfo = githubIntegration.metadata;

		// Initialize toolset with entity ID from repository configuration
		const toolset = new VercelAIToolSet({
			apiKey: process.env.COMPOSIO_API_KEY,
		});

		// Get GitHub tools from Composio with entity ID
		const tools = await toolset.getTools(
			{
				apps: ['github'],
				actions: [
					'GITHUB_CREATE_AN_ISSUE',
					'GITHUB_LIST_ISSUES',
					'GITHUB_GET_ISSUE',
					'GITHUB_UPDATE_AN_ISSUE',
				],
			},
			entityId // Pass entity ID as second parameter
		);

		console.log('[GitHub Assistant] Available tools:', tools.length);
		console.log(
			'[GitHub Assistant] Target repository:',
			repositoryInfo?.fullName || 'Unknown'
		);

		// Create a system prompt that helps the AI understand when to use GitHub tools
		const systemPrompt = `You are a helpful GitHub assistant that can interact with GitHub repositories.

You have access to GitHub tools to:
- Create issues
- List issues
- Get issue details
- Update issues

TARGET REPOSITORY: ${repositoryInfo?.fullName || 'Connected GitHub Repository'}

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to create a GitHub issue, use the GITHUB_CREATE_AN_ISSUE tool with:
   - owner: "${repositoryInfo?.owner || 'repository_owner'}"
   - repo: "${repositoryInfo?.repo || 'repository_name'}"
   - title: (meaningful title based on user request)
   - body: (detailed description using workspace context)

2. If the user wants to list issues, use GITHUB_LIST_ISSUES tool with:
   - owner: "${repositoryInfo?.owner || 'repository_owner'}"
   - repo: "${repositoryInfo?.repo || 'repository_name'}"

3. If the user wants to get details about a specific issue, use GITHUB_GET_ISSUE tool with:
   - owner: "${repositoryInfo?.owner || 'repository_owner'}"
   - repo: "${repositoryInfo?.repo || 'repository_name'}"
   - issue_number: (the issue number)

4. If the user wants to update an issue, use GITHUB_UPDATE_AN_ISSUE tool with:
   - owner: "${repositoryInfo?.owner || 'repository_owner'}"
   - repo: "${repositoryInfo?.repo || 'repository_name'}"
   - issue_number: (the issue number)

When creating issues:
- Use the workspace context to provide relevant details
- Create meaningful titles and descriptions
- Include relevant labels if mentioned
- Always include the repository owner and repo parameters

Always confirm what action you're taking and provide clear feedback about the results.`;

		// Generate response with tools using Vercel AI SDK
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			tools,
			prompt: `${systemPrompt}\n\nUser: ${message}`,
			toolChoice: 'auto',
		});

		console.log('[GitHub Assistant] AI response generated');

		// Extract tool results from the result
		const toolResults = [];
		if (result.toolCalls && result.toolCalls.length > 0) {
			console.log(
				'[GitHub Assistant] Tool calls executed:',
				result.toolCalls.length
			);

			for (const toolCall of result.toolCalls) {
				toolResults.push({
					toolName: toolCall.toolName,
					args: toolCall.args,
					// Tool results are handled automatically by Vercel AI SDK
				});
				console.log('[GitHub Assistant] Tool executed:', toolCall.toolName);
			}
		}

		return NextResponse.json({
			success: true,
			response: result.text || 'GitHub action completed successfully!',
			toolCalls: result.toolCalls || [],
			toolResults,
			hasGitHubAction: toolResults.length > 0,
			repository: repositoryInfo?.fullName || 'Connected Repository',
		});
	} catch (error) {
		console.error('[GitHub Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
