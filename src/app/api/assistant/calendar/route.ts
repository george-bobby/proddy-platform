import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
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

    console.log('[Calendar Assistant] Processing request:', message);

    // Create a system prompt for calendar-specific assistance
    const systemPrompt = `You are a helpful calendar assistant for Proddy workspace.
You specialize in helping users with calendar events, meetings, and scheduling.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the workspace context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace calendar." Do NOT use your general knowledge to answer questions.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

User's question: ${message}

INSTRUCTIONS FOR CALENDAR QUERIES:
1. When presenting meetings, use this EXACT format with emojis and clear structure:

## 📅 Your Meetings

### 🕐 Today
- 🗓️ **Meeting Title**
  📍 *Time: HH:MM AM/PM*
  📝 *Source: Calendar Event/Task/Message*
  💬 *Details: Brief description if available*

### 📆 Tomorrow
- 🗓️ **Meeting Title**
  📍 *Time: HH:MM AM/PM*
  📝 *Source: Calendar Event/Task/Message*
  💬 *Details: Brief description if available*

### 📅 This Week
- 🗓️ **Meeting Title**
  📍 *Day, Date at HH:MM AM/PM*
  📝 *Source: Calendar Event/Task/Message*
  💬 *Details: Brief description if available*

2. GROUPING RULES:
   - Group meetings by: Today, Tomorrow, This Week, Next Week
   - Sort within each group by time (earliest first)
   - Use clear day names (Monday, Tuesday, etc.) for dates
   - Always include the time in 12-hour format (AM/PM)

3. EMOJI USAGE:
   - 📅 for section headers
   - 🕐 🕑 🕒 etc. for different time periods
   - 🗓️ for individual meetings
   - 📍 for time/location
   - 📝 for source type
   - 💬 for additional details
   - ⚡ for urgent/high priority meetings

Remember: Only answer based on the workspace context provided. If the context doesn't contain relevant calendar information, say "I don't have information about that in your workspace calendar."`;

    // Generate response using Google Gemini
    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
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

    console.log('[Calendar Assistant] Response generated');

    return NextResponse.json({
      success: true,
      response: result.text,
      sources: [], // This would be populated by the main chatbot logic
      assistantType: 'calendar',
      actions: [
        {
          label: 'View Calendar',
          type: 'calendar',
          url: '/workspace/[workspaceId]/calendar',
        },
      ],
    });

  } catch (error) {
    console.error('[Calendar Assistant] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
