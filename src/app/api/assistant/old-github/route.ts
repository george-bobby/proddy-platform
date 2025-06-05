import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { VercelAIToolSet } from 'composio-core';
import { generateText } from 'ai';

const toolset = new VercelAIToolSet({
	apiKey: process.env.COMPOSIO_API_KEY,
});

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		console.log('[GitHub Assistant] Processing request:', message);

		// Get GitHub tools from Composio
		const tools = await toolset.getTools({
			apps: ['github'],
			actions: [
				'GITHUB_CREATE_AN_ISSUE',
				'GITHUB_LIST_ISSUES',
				'GITHUB_GET_ISSUE',
				'GITHUB_UPDATE_AN_ISSUE',
			],
		});

		// Define your target repository
		const GITHUB_OWNER = 'george-bobby';
		const GITHUB_REPO = 'proddy-test';

		console.log('[GitHub Assistant] Available tools:', tools.length);
		console.log(
			'[GitHub Assistant] Target repository:',
			`${GITHUB_OWNER}/${GITHUB_REPO}`
		);

		// Create a system prompt that helps the AI understand when to use GitHub tools
		const systemPrompt = `You are a helpful GitHub assistant that can interact with GitHub repositories.

You have access to GitHub tools to:
- Create issues
- List issues
- Get issue details
- Update issues

TARGET REPOSITORY: ${GITHUB_OWNER}/${GITHUB_REPO}

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

INSTRUCTIONS:
1. If the user wants to create a GitHub issue, use the GITHUB_CREATE_AN_ISSUE tool with:
   - owner: "${GITHUB_OWNER}"
   - repo: "${GITHUB_REPO}"
   - title: (meaningful title based on user request)
   - body: (detailed description using workspace context)

2. If the user wants to list issues, use GITHUB_LIST_ISSUES tool with:
   - owner: "${GITHUB_OWNER}"
   - repo: "${GITHUB_REPO}"

3. If the user wants to get details about a specific issue, use GITHUB_GET_ISSUE tool with:
   - owner: "${GITHUB_OWNER}"
   - repo: "${GITHUB_REPO}"
   - issue_number: (the issue number)

4. If the user wants to update an issue, use GITHUB_UPDATE_AN_ISSUE tool with:
   - owner: "${GITHUB_OWNER}"
   - repo: "${GITHUB_REPO}"
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
			repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
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
