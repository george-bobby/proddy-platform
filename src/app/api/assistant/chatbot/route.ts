import {NextRequest, NextResponse} from 'next/server';
import {openai} from '@ai-sdk/openai';
import {generateText} from 'ai';
import {ConvexHttpClient} from 'convex/browser';
import {api} from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const {message, workspaceContext, workspaceId} = await req.json();

        if (!message || !workspaceId) {
            return NextResponse.json(
                {error: 'Message and workspaceId are required'},
                {status: 400}
            );
        }

        console.log('[Chatbot Assistant] Processing request:', message);

        // Search for relevant workspace content using semantic search
        const searchResults = await convex.action(api.search.searchAllSemantic, {
            workspaceId,
            query: message,
            limit: 10,
        });

        console.log(
            '[Chatbot Assistant] Found',
            searchResults.length,
            'search results'
        );

        // Prepare enhanced workspace context with search results
        const enhancedContext = `
${workspaceContext || ''}

SEARCH RESULTS FROM WORKSPACE:
${searchResults.map((result, index) => `
${index + 1}. [${result.type.toUpperCase()}] ${result.text}
   ID: ${result._id}
   ${result.type === 'message' ? `Channel: ${(result as any).channelId || 'Unknown'}` : ''}
   ${result.type === 'task' ? `Status: ${(result as any).status || 'Unknown'} | Completed: ${(result as any).completed || false}` : ''}
   ${result.type === 'note' ? `Channel: ${(result as any).channelId || 'Unknown'}` : ''}
   ${result.type === 'card' ? `List: ${(result as any).listName || 'Unknown'} | Channel: ${(result as any).channelName || 'Unknown'}` : ''}
`).join('')}
`;

        const systemPrompt = `You are Proddy AI, an intelligent workspace assistant that helps teams stay organized and productive. You have access to comprehensive workspace data including messages, tasks, notes, and board cards.

CAPABILITIES:
- Search and analyze all workspace content (messages, tasks, notes, board cards)
- Provide contextual answers based on workspace data
- Format responses appropriately for different content types
- Generate navigation actions to help users find relevant content
- Offer insights and suggestions for productivity
- Handle specialized queries like "what are my meetings", "add this to my task list", "what is the status of this?"

SPECIALIZED FORMATTING FOR CONTENT TYPES:

**MESSAGES/CHATS**:
- Show conversation context, participants, channels, and key discussion points
- Format: "💬 **Chat Message** in #channel-name"
- Include sender information and timestamps when available
- Highlight important discussions or decisions

**TASKS**:
- Display status, completion state, assignments, priorities, and due dates
- Format: "✅ **Task**: [Title] - Status: [status] | Priority: [priority]"
- Show progress indicators and completion percentages
- Highlight overdue or high-priority items

**NOTES**:
- Present titles, content summaries, associated channels, and key information
- Format: "📝 **Note**: [Title] in #channel-name"
- Include creation date and last modified information
- Show content snippets and key topics

**BOARD CARDS**:
- Show card details, list placement, status, and project context
- Format: "🎯 **Card**: [Title] in [List Name] | [Channel Name]"
- Include assignees, due dates, and priority levels
- Show progress through workflow stages

RESPONSE GUIDELINES:
1. Always base responses on the provided workspace context and search results
2. Format information clearly with appropriate headers, emojis, and bullet points
3. Provide specific details when available (IDs, channels, statuses, etc.)
4. Generate helpful navigation actions when relevant content is found
5. Be concise but comprehensive in your responses
6. If no relevant information is found, clearly state this and suggest alternatives
7. For queries like "add this to my task list" - acknowledge the request but explain you can't directly modify data
8. For status queries - provide detailed status information from the search results
9. For meeting queries - search through messages and notes for meeting-related content

WORKSPACE CONTEXT:
${enhancedContext}

Remember: Only answer based on the workspace context provided. If the context doesn't contain relevant information, say "I don't have information about that in your workspace" and suggest how the user might find what they're looking for.`;

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

        console.log('[Chatbot Assistant] Response generated');

        // Prepare sources for the response
        const sources = searchResults.map((result: any) => ({
            id: result._id,
            type: result.type,
            text: result.text.substring(0, 100) + (result.text.length > 100 ? '...' : ''),
        }));

        // Generate navigation actions based on search results
        const actions = [];

        // Check for notes content
        const notesResults = searchResults.filter(
            (result: any) => result.type === 'note'
        );
        if (notesResults.length > 0) {
            const firstNote = notesResults[0];
            const channelId = (firstNote as any).channelId;
            if (channelId) {
                actions.push({
                    label: 'View Note',
                    type: 'note',
                    url: `/workspace/[workspaceId]/channel/[channelId]/notes?noteId=[noteId]`,
                    noteId: firstNote._id.toString(),
                    channelId: channelId.toString(),
                });
            }
        }

        // Check for board cards content
        const cardResults = searchResults.filter(
            (result: any) => result.type === 'card'
        );
        if (cardResults.length > 0) {
            const firstCard = cardResults[0];
            const channelId = (firstCard as any).channelId;
            if (channelId) {
                actions.push({
                    label: 'View Board',
                    type: 'board',
                    url: `/workspace/[workspaceId]/channel/[channelId]/board`,
                    channelId: channelId.toString(),
                });
            }
        }

        // Check for task content
        if (searchResults.some((result: any) => result.type === 'task')) {
            actions.push({
                label: 'View Tasks',
                type: 'task',
                url: '/workspace/[workspaceId]/tasks',
            });
        }

        // Check for message content
        const messageResults = searchResults.filter(
            (result) => result.type === 'message'
        );
        if (messageResults.length > 0) {
            const firstMessage = messageResults[0];
            const channelId = (firstMessage as any).channelId;
            if (channelId) {
                actions.push({
                    label: 'View Channel Chats',
                    type: 'message',
                    url: `/workspace/[workspaceId]/channel/[channelId]/chats`,
                    channelId: channelId.toString(),
                });
            }
        }

        return NextResponse.json({
            success: true,
            response: result.text,
            sources,
            actions,
            assistantType: 'chatbot',
        });
    } catch (error) {
        console.error('[Chatbot Assistant] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            {status: 500}
        );
    }
}
