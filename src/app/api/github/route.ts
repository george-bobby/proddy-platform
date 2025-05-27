import { NextRequest, NextResponse } from 'next/server';
import { OpenAIToolSet } from 'composio-core';
import OpenAI from 'openai';

const toolset = new OpenAIToolSet({
	apiKey: process.env.COMPOSIO_API_KEY,
});

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
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

		console.log('[GitHub API] Processing request:', message);

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
		const GITHUB_OWNER = process.env.GITHUB_OWNER || 'georgepro'; // Replace with your actual GitHub username
		const GITHUB_REPO = process.env.GITHUB_REPO || 'proddy-platform'; // Replace with your actual repository name

		console.log('[GitHub API] Available tools:', tools.length);

		// Create a system prompt that helps the AI understand when to use GitHub tools
		const systemPrompt = `You are a helpful assistant that can interact with GitHub repositories.

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

		// Generate response with tools using OpenAI directly
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: message,
				},
			],
			tools,
		});

		console.log('[GitHub API] AI response generated');

		const aiMessage = response.choices[0].message;
		const toolCalls = aiMessage.tool_calls || [];

		// Execute any tool calls
		const toolResults = [];
		if (toolCalls.length > 0) {
			console.log('[GitHub API] Executing tool calls:', toolCalls.length);

			for (const toolCall of toolCalls) {
				try {
					const toolResult = await toolset.executeToolCall(toolCall);
					toolResults.push({
						toolName: toolCall.function.name,
						args: JSON.parse(toolCall.function.arguments),
						result: toolResult,
					});
					console.log('[GitHub API] Tool executed:', toolCall.function.name);
				} catch (toolError) {
					console.error('[GitHub API] Tool execution error:', toolError);
					toolResults.push({
						toolName: toolCall.function.name,
						args: JSON.parse(toolCall.function.arguments),
						error:
							toolError instanceof Error ? toolError.message : 'Unknown error',
					});
				}
			}
		}

		return NextResponse.json({
			success: true,
			response: aiMessage.content || 'Action completed successfully!',
			toolCalls: toolCalls,
			toolResults,
			hasGitHubAction: toolResults.length > 0,
		});
	} catch (error) {
		console.error('[GitHub API] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
