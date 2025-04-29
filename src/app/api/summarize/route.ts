import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { format } from 'date-fns';
import * as dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

// Load environment variables
dotenv.config();

// Define message interface for type safety
interface MessageData {
  body: string;
  authorName: string;
  creationTime: number;
}

// Function to extract plain text from a rich text JSON format
function extractTextFromRichText(body: string): string {
  console.log('[extractText] Input body:', body);

  if (typeof body !== 'string') {
    console.log('[extractText] Body is not a string. Returning as is.');
    return String(body);
  }

  const trimmedBody = body.trim();

  // Only attempt parsing if it looks like a JSON object string
  if (trimmedBody.startsWith('{') && trimmedBody.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmedBody);
      console.log('[extractText] Parsed JSON:', parsed);

      // Check for lowercase 'ops' key
      if (parsed && Array.isArray(parsed.ops)) {
        console.log("[extractText] Found 'ops' array. Processing...");
        let extractedText = '';
        // Iterate over lowercase 'ops'
        for (const op of parsed.ops) {
          // Check if the operation has an INSERT field and it's a string
          if (op && typeof op.insert === 'string') {
            extractedText += op.insert;
            console.log(`[extractText] Added text: "${op.insert}"`);
          } else {
            console.log("[extractText] Skipping op, no valid 'insert' found:", op);
          }
        }

        // Clean up common newline representations and trim whitespace
        const cleanedText = extractedText
          .replace(/\\n|\\N|\n/g, ' ') // Replace \n, \N, and actual newlines with space
          .trim();

        console.log('[extractText] Final extracted and cleaned text:', cleanedText);
        return cleanedText; // Return the successfully extracted text
      } else {
        console.log("[extractText] Parsed JSON does not contain expected 'ops' array. Returning original body.");
        return body; // Not the ops format we expected
      }
    } catch (error) {
      console.error('[extractText] JSON parsing failed:', error);
      // If parsing fails, it wasn't valid JSON, return original string
      return body;
    }
  } else {
    console.log('[extractText] Body does not look like a JSON object string. Returning as is.');
    // Does not look like a JSON object string, return original
    return body;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Summarize API called');

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      console.error('Missing NEXT_PUBLIC_GEMINI_API');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Parse request body
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

    // Format messages for the AI model
    const chatHistory = messages
      .map((msg: MessageData) => {
        try {
          // Extract plain text from rich text message body
          const plainText = extractTextFromRichText(msg.body);

          // Format timestamp
          let timestamp;
          try {
            const date = new Date(msg.creationTime);
            timestamp = format(date, 'MM/dd/yyyy, h:mm a');
          } catch (dateError) {
            console.error('Date formatting error:', dateError);
            timestamp = 'Unknown time';
          }

          return `[${timestamp}] ${msg.authorName}: ${plainText}`;
        } catch (error) {
          console.error('Error formatting message for AI:', error);
          return ''; // Skip problematic messages
        }
      })
      .filter(Boolean)
      .join('\n');

    console.log('Formatted chat history for AI:', chatHistory);

    // Generate summary using Gemini API
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

      console.log('Generated summary:', text);
      return NextResponse.json({ summary: text });
    } catch (aiError) {
      console.error('AI summarization error:', aiError);

      // Fallback to capitalization if AI fails
      console.log('Falling back to capitalization method');
      const formattedMessages = messages.map((msg: MessageData) => {
        const plainText = extractTextFromRichText(msg.body);
        const formattedDate = format(new Date(msg.creationTime), "MMM d, yyyy 'at' h:mm a");
        return `[${msg.authorName} on ${formattedDate}]: ${plainText.toUpperCase()}`;
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
