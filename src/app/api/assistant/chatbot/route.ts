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

    console.log('[Chatbot Assistant] Processing request:', message);

    // Create a system prompt for general workspace assistance
    const systemPrompt = `You are a helpful workspace assistant for Proddy, a team collaboration platform.
You can help users with information about their workspace, tasks, messages, and other features.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the workspace context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace." Do NOT use your general knowledge to answer questions.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context provided'}

User's question: ${message}

Remember: Only answer based on the workspace context provided. If the context doesn't contain relevant information, say "I don't have information about that in your workspace."`;

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

    console.log('[Chatbot Assistant] Response generated');

    return NextResponse.json({
      success: true,
      response: result.text,
      sources: [], // This would be populated by the main chatbot logic
      assistantType: 'chatbot',
    });

  } catch (error) {
    console.error('[Chatbot Assistant] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
