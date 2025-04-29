import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { action, mutation, query } from './_generated/server';

// This function will fetch the selected messages and return them
export const getSelectedMessages = query({
  args: {
    messageIds: v.array(v.id('messages')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    const messages = await Promise.all(
      args.messageIds.map(async (id) => {
        const message = await ctx.db.get(id);
        if (!message) return null;

        const member = await ctx.db.get(message.memberId);
        if (!member) return null;

        const user = await ctx.db.get(member.userId);
        if (!user) return null;

        return {
          ...message,
          author: user.name,
          content: message.body,
        };
      })
    );

    // Filter out any null messages
    return messages.filter(Boolean);
  },
});

// This function will summarize the selected messages using an AI model
export const summarizeMessages = action({
  args: {
    messageIds: v.array(v.id('messages')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    // Get the messages from the database
    const messagesResponse = await ctx.runQuery(getSelectedMessages, {
      messageIds: args.messageIds,
    });

    if (!messagesResponse || messagesResponse.length === 0) {
      throw new Error('No messages found to summarize');
    }

    // Sort messages by creation time
    const messages = messagesResponse.sort(
      (a, b) => new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime()
    );

    // Format messages for the AI model
    const formattedMessages = messages
      .map((msg) => {
        const date = new Date(msg._creationTime).toLocaleString();
        return `[${date}] ${msg.author}: ${JSON.parse(msg.content)}`;
      })
      .join('\n\n');

    try {
      // In a real implementation, you would call an AI model here
      // For now, we'll return a placeholder summary
      
      // TODO: Replace with actual AI call
      // Example of how you might call an AI model:
      /*
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
            content: formattedMessages,
          },
        ],
      });
      
      return text;
      */
      
      // Placeholder summary
      return `Summary of ${messages.length} messages: The conversation covered various topics including project updates, scheduling, and task assignments. Team members discussed upcoming deadlines and allocated responsibilities for the next sprint. Several action items were identified including documentation updates and client presentations.`;
    } catch (error) {
      console.error('Error summarizing messages:', error);
      throw new Error('Failed to summarize messages');
    }
  },
});
