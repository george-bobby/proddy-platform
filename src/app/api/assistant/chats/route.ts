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

		console.log('[Chats Assistant] Processing request:', message);

		// Create a system prompt for chats-specific assistance
		const systemPrompt = `You are a helpful chats assistant for Proddy workspace.
You specialize in helping users with team communication, message history, and conversation management.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the workspace context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace chats." Do NOT use your general knowledge to answer questions.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

User's question: ${message}

INSTRUCTIONS FOR CHAT QUERIES:
1. When presenting chat information, use this EXACT format with emojis and clear structure:

## 💬 Your Recent Chats
### 📢 Channels
• **#[channel-name]** - Last message: [time] - [message preview]
• **#[channel-name]** - [participant count] members - Topic: [topic]

### 👥 Direct Messages
• **[User name]** - Last message: [time] - [message preview]
• **[User name]** - Status: [online/offline] - [message preview]

### 🔔 Mentions & Notifications
• **[Channel/User]** - Mentioned you: [time] - "[message preview]"
• **[Channel/User]** - Reply to thread: [time] - "[message preview]"

2. For message search queries:
   - Summarize relevant messages found
   - Include timestamps and senders
   - Provide context around the messages
   - Use 💬 for regular messages, 🔄 for replies, 🔔 for mentions

3. For conversation summaries:
   - Highlight key discussion points
   - Include action items or decisions made
   - Show participant engagement levels
   - Note any unresolved questions or follow-ups

4. For team communication insights:
   - Show most active channels or conversations
   - Highlight recent team discussions
   - Summarize communication patterns
   - Suggest channels or people to follow up with

5. For message management:
   - Help find specific conversations or topics
   - Suggest relevant channels for questions
   - Provide communication best practices based on workspace activity

Always focus on facilitating better team communication and helping users stay connected with their workspace conversations.`;

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

		console.log('[Chats Assistant] Response generated');

		return NextResponse.json({
			success: true,
			response: result.text,
			sources: [], // This would be populated by the main chatbot logic
			assistantType: 'chats',
			actions: [
				{
					label: 'View Chats',
					type: 'message',
					url: '/workspace/[workspaceId]/chats',
				},
			],
		});
	} catch (error) {
		console.error('[Chats Assistant] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
