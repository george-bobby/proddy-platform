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

		console.log('[Board Assistant] Processing request:', message);

		// Create a system prompt for board-specific assistance
		const systemPrompt = `You are a helpful board assistant for Proddy workspace.
You specialize in helping users with Kanban boards, card management, and visual project organization.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the workspace context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace boards." Do NOT use your general knowledge to answer questions.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

User's question: ${message}

INSTRUCTIONS FOR BOARD QUERIES:
1. When presenting board information, use this EXACT format with emojis and clear structure:

## 📋 Your Boards
### 🗂️ [Board/Channel Name]
**📝 To Do**
• [Card title] - Assignee: [assignee] - Due: [date]
• [Card title] - Priority: [priority]

**🔄 In Progress**
• [Card title] - Assignee: [assignee] - Progress: [details]
• [Card title] - Due: [date]

**✅ Done**
• [Card title] - Completed by: [assignee] - Date: [date]

2. For card status queries:
   - Use column-based organization (To Do, In Progress, Done, etc.)
   - Include assignees, due dates, and priorities when available
   - Use emojis for visual clarity: 📝 (to do), 🔄 (in progress), ✅ (done), ⚠️ (blocked)

3. For workflow insights:
   - Summarize card distribution across columns
   - Highlight bottlenecks or overloaded columns
   - Suggest workflow optimizations based on current board state

4. For card creation or modification requests:
   - Explain what information is needed
   - Suggest using the board interface for visual management
   - Reference existing similar cards if found in context

5. For board organization:
   - Help with categorizing cards
   - Suggest label or tag usage
   - Provide insights on board performance and team productivity

Always focus on visual organization and workflow efficiency in your responses.`;

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

		console.log('[Board Assistant] Response generated');

		return NextResponse.json({
			success: true,
			response: result.text,
			sources: [], // This would be populated by the main chatbot logic
			assistantType: 'board',
			actions: [
				{
					label: 'View Boards',
					type: 'board',
					url: '/workspace/[workspaceId]/channels',
				},
			],
		});
	} catch (error) {
		console.error('[Board Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
