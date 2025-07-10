import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext, workspaceId, userId, toolkit } = await req.json();

		if (!message || !userId || !toolkit) {
			return NextResponse.json(
				{ error: 'Message, userId, and toolkit are required' },
				{ status: 400 }
			);
		}

		console.log(`[AgentAuth Assistant] Processing ${toolkit} request for user ${userId}`);

		// Step 3: Power your Agents with Intuition
		// Fetch tools for the connected toolkit using AgentAuth
		const toolsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/composio/agentauth?userId=${userId}&toolkit=${toolkit}`, {
			method: 'GET',
		});

		if (!toolsResponse.ok) {
			return NextResponse.json(
				{ error: `No ${toolkit} connection found. Please connect your ${toolkit} account first.` },
				{ status: 400 }
			);
		}

		const { tools } = await toolsResponse.json();

		if (!tools || tools.length === 0) {
			return NextResponse.json(
				{ error: `No tools available for ${toolkit}. Please check your connection.` },
				{ status: 400 }
			);
		}

		console.log(`[AgentAuth Assistant] Found ${tools.length} tools for ${toolkit}`);

		// Create system prompt based on toolkit
		const systemPrompts = {
			github: `You are a helpful GitHub assistant that can interact with GitHub repositories and issues.
			
Available capabilities:
- Create, read, update repositories
- Manage issues and pull requests
- Search repositories and code
- Manage branches and commits
- Handle GitHub workflows

Use the provided tools to help users with their GitHub-related tasks. Always confirm what action you're taking and provide clear feedback about the results.`,

			gmail: `You are a helpful Gmail assistant that can manage emails and contacts.
			
Available capabilities:
- Send and read emails
- Manage labels and filters
- Search emails
- Handle attachments
- Manage contacts

Use the provided tools to help users with their email management tasks. Always confirm what action you're taking and provide clear feedback about the results.`,

			slack: `You are a helpful Slack assistant that can interact with Slack workspaces.
			
Available capabilities:
- Send messages to channels and users
- Create and manage channels
- Search messages and files
- Manage user presence
- Handle Slack workflows

Use the provided tools to help users with their Slack-related tasks. Always confirm what action you're taking and provide clear feedback about the results.`,

			jira: `You are a helpful Jira assistant that can manage projects and issues.
			
Available capabilities:
- Create, read, update issues
- Manage projects and boards
- Handle sprints and workflows
- Search issues and projects
- Manage users and permissions

Use the provided tools to help users with their Jira project management tasks. Always confirm what action you're taking and provide clear feedback about the results.`,

			notion: `You are a helpful Notion assistant that can manage pages and databases.
			
Available capabilities:
- Create, read, update pages
- Manage databases and properties
- Search content
- Handle blocks and content
- Manage workspace settings

Use the provided tools to help users with their Notion workspace tasks. Always confirm what action you're taking and provide clear feedback about the results.`,

			clickup: `You are a helpful ClickUp assistant that can manage tasks and projects.
			
Available capabilities:
- Create, read, update tasks
- Manage lists, folders, and spaces
- Handle time tracking
- Search tasks and projects
- Manage team members and permissions

Use the provided tools to help users with their ClickUp project management tasks. Always confirm what action you're taking and provide clear feedback about the results.`
		};

		const systemPrompt = systemPrompts[toolkit as keyof typeof systemPrompts] || 
			`You are a helpful ${toolkit} assistant. Use the provided tools to help users with their ${toolkit}-related tasks.`;

		// Enhanced context with workspace information
		const enhancedContext = `
${workspaceContext || ''}

User Request: ${message}
Connected Service: ${toolkit}
Available Tools: ${tools.length} tools ready for use
`;

		// Generate response with tools using Vercel AI SDK
		// Note: In a real implementation, you would convert Composio tools to Vercel AI SDK format
		const result = await generateText({
			model: openai('gpt-4o-mini'),
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: enhancedContext,
				},
			],
			// tools, // In real implementation, convert Composio tools to Vercel AI format
			// toolChoice: 'auto',
			temperature: 0.7,
			maxTokens: 800,
		});

		console.log(`[AgentAuth Assistant] ${toolkit} response generated`);

		// In a real implementation, you would execute the tools here
		// For now, we'll return a response indicating the tools are available
		return NextResponse.json({
			success: true,
			response: result.text + `\n\n✅ Connected to ${toolkit} with ${tools.length} available tools via AgentAuth.`,
			toolkit,
			toolsAvailable: tools.length,
			agentAuthEnabled: true,
		});
	} catch (error) {
		console.error(`[AgentAuth Assistant] Error:`, error);
		return NextResponse.json(
			{ error: 'AgentAuth assistant operation failed' },
			{ status: 500 }
		);
	}
}
