import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
	try {
		const { message, workspaceContext } = await req.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		console.log('[Tasks Assistant] Processing request:', message);

		// Create a system prompt for tasks-specific assistance
		const systemPrompt = `You are a helpful tasks assistant for Proddy workspace.
You specialize in helping users with task management, project tracking, and productivity.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the workspace context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace tasks." Do NOT use your general knowledge to answer questions.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

User's question: ${message}

INSTRUCTIONS FOR TASK QUERIES:
1. When presenting tasks, use this EXACT format with emojis and clear structure:

## ✅ Your Tasks
### 📋 To Do
• [Task name] - Due: [date] - Priority: [priority]
• [Task name] - Due: [date] - Priority: [priority]

### 🔄 In Progress  
• [Task name] - Assigned: [assignee] - Due: [date]
• [Task name] - Assigned: [assignee] - Due: [date]

### ✅ Completed
• [Task name] - Completed: [date] - Assignee: [assignee]

2. For task status queries:
   - Use appropriate emojis: ✅ (completed), 🔄 (in progress), 📋 (to do), ⚠️ (overdue)
   - Include due dates, priorities, and assignees when available
   - Group by status or priority as requested

3. For task creation or modification requests:
   - Explain what information is needed
   - Suggest using the task creation interface
   - Reference existing similar tasks if found in context

4. For productivity insights:
   - Summarize task completion rates
   - Highlight overdue or high-priority items
   - Suggest task organization strategies based on existing data

Always focus on actionable information and provide clear, organized responses about task management.`;

		// Generate response using OpenAI
		const result = await generateText({
			model: openai('gpt-4o-mini'),
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
			temperature: 0.7,
			maxTokens: 800,
		});

		console.log('[Tasks Assistant] Response generated');

		return NextResponse.json({
			success: true,
			response: result.text,
			sources: [], // This would be populated by the main chatbot logic
			assistantType: 'tasks',
			actions: [
				{
					label: 'View Tasks',
					type: 'task',
					url: '/workspace/[workspaceId]/tasks',
				},
			],
		});
	} catch (error) {
		console.error('[Tasks Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
