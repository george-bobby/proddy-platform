import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check API key
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables.');
}

// Initialize Convex client
const convex = new ConvexHttpClient('https://neat-firefly-26.convex.cloud');

// Fetch messages from Convex
async function fetchMessages() {
  try {
    const messages = await (convex as any).query('messages:list');

    messages.sort((a: any, b: any) => new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime());

    console.log(`Total messages fetched: ${messages.length}`);

    const formattedMessages = messages
      .map((msg: any) => {
        const date = new Date(msg._creationTime).toLocaleString();
        return `[${date}] ${msg.author}: ${msg.content}`;
      })
      .join('\n\n');

    return formattedMessages;
  } catch (error) {
    console.error('Error fetching messages from Convex:', error);
    throw error;
  }
}

// Summarize chat history using Gemini
export const summarizeText = async (input: string) => {
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
        content: input,
      },
    ],
  });

  return text;
};

// Main workflow
async function main() {
  try {
    console.log('Fetching messages from Convex...');
    const chatHistory = await fetchMessages();

    console.log('Chat history fetched. Length:', chatHistory.length, 'characters');
    console.log('Sample of chat history:', chatHistory.substring(0, 200) + '...');

    console.log('Generating summary...');
    const summary = await summarizeText(chatHistory);

    console.log('\n--- CHAT SUMMARY ---');
    console.log(summary);
    console.log('--------------------');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

// npx ts-node convex-summarizer.ts
