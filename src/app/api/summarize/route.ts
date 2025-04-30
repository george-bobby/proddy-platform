import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { format } from 'date-fns';
import * as dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

// Load environment variables
dotenv.config();

interface MessageData {
  body: string;
  authorName: string;
  creationTime: number;
}

function extractTextFromRichText(body: string): string {
  if (typeof body !== 'string') {
    return String(body);
  }

  const trimmedBody = body.trim();

  if (trimmedBody.startsWith('{') && trimmedBody.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmedBody);

      if (parsed && Array.isArray(parsed.ops)) {
        let extractedText = '';

        for (const op of parsed.ops) {
          if (op && typeof op.insert === 'string') {
            extractedText += op.insert;
          }
        }

        return extractedText.replace(/\\n|\\N|\n/g, ' ').trim();
      }
      return body;
    } catch (error) {
      return body;
    }
  }
  return body;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      console.error('Missing NEXT_PUBLIC_GEMINI_API');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request' }, { status: 400 });
    }

    const { messages } = requestData;

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages to summarize' }, { status: 400 });
    }

    const chatHistory = messages
      .map((msg: MessageData) => {
        try {
          const plainText = extractTextFromRichText(msg.body);

          let timestamp;
          try {
            const date = new Date(msg.creationTime);
            timestamp = format(date, 'MM/dd/yyyy, h:mm a');
          } catch (dateError) {
            timestamp = 'Unknown time';
          }

          return `[${timestamp}] ${msg.authorName}: ${plainText}`;
        } catch (error) {
          return '';
        }
      })
      .filter(Boolean)
      .join('\n');

    try {
      const { text } = await generateText({
        model: google('gemini-1.5-pro'),
        messages: [
          {
            role: 'system',
            content: `You are a text summarizer for a group chat conversation.
Summarize the chat conversation you receive.
Identify the main topics discussed, key decisions made, and action items.
Group related messages by topic rather than chronologically.
Be concise but comprehensive.
Return only the summary.
Do not use the phrase "here is a summary".
Highlight important topics, names, and action items in bold.
The summary should be 3-5 sentences long.
If there are action items or deadlines mentioned, include them in the summary.`,
          },
          {
            role: 'user',
            content: chatHistory,
          },
        ],
      });

      return NextResponse.json({ summary: text });
    } catch (aiError) {
      console.error('AI summarization error:', aiError);

      // Fallback to formatting if AI fails
      const formattedMessages = messages.map((msg: MessageData) => {
        const plainText = extractTextFromRichText(msg.body);
        const formattedDate = format(new Date(msg.creationTime), "MMM d, yyyy 'at' h:mm a");
        return `[${msg.authorName} on ${formattedDate}]: ${plainText}`;
      });

      const fallbackSummary = formattedMessages.join('\n\n--------\n\n');
      return NextResponse.json({
        summary: fallbackSummary,
        note: 'AI summarization failed, showing formatted messages instead',
      });
    }
  } catch (error) {
    console.error('Error in summarize route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
