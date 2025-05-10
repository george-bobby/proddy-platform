import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { type QueryCtx, type MutationCtx, mutation, query, action } from './_generated/server';

// Helper function to get a member by ID
const getMemberById = async (ctx: QueryCtx, memberId: Id<'members'>) => {
  return await ctx.db.get(memberId);
};

// Helper function to get a user by ID
const getUserById = async (ctx: QueryCtx, userId: Id<'users'>) => {
  return await ctx.db.get(userId);
};

// Helper function to get a channel by ID
const getChannelById = async (ctx: QueryCtx, channelId: Id<'channels'>) => {
  return await ctx.db.get(channelId);
};

// Helper function to get a message by ID
const getMessageById = async (ctx: QueryCtx, messageId: Id<'messages'>) => {
  return await ctx.db.get(messageId);
};

// Helper function to extract text from a message body (Quill Delta or HTML)
const extractMessageText = (body: string, maxLength = 150): string => {
  try {
    // Try to parse as JSON (Quill Delta format)
    const parsedBody = JSON.parse(body);
    if (parsedBody.ops) {
      const text = parsedBody.ops
        .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
        .join('')
        .trim();

      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
  } catch (e) {
    // Not JSON, might be HTML or plain text
  }

  // Try to handle as HTML
  const plainText = body
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();

  return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
};

// Send an email for a mention
export const sendMentionEmail = action({
  args: {
    mentionId: v.id('mentions'),
  },
  handler: async (ctx, args) => {
    try {
      // Get the mention
      const mention = await ctx.runQuery(async (ctx) => {
        return await ctx.db.get(args.mentionId);
      });

      if (!mention) {
        throw new Error('Mention not found');
      }

      // Get the mentioned member
      const mentionedMember = await ctx.runQuery(async (ctx) => {
        return await getMemberById(ctx, mention.mentionedMemberId);
      });

      if (!mentionedMember) {
        throw new Error('Mentioned member not found');
      }

      // Get the mentioner member
      const mentionerMember = await ctx.runQuery(async (ctx) => {
        return await getMemberById(ctx, mention.mentionerMemberId);
      });

      if (!mentionerMember) {
        throw new Error('Mentioner member not found');
      }

      // Get the users
      const mentionedUser = await ctx.runQuery(async (ctx) => {
        return await getUserById(ctx, mentionedMember.userId);
      });

      const mentionerUser = await ctx.runQuery(async (ctx) => {
        return await getUserById(ctx, mentionerMember.userId);
      });

      if (!mentionedUser || !mentionerUser) {
        throw new Error('User not found');
      }

      // Get the channel if it exists
      let channelName = 'a conversation';
      if (mention.channelId) {
        const channel = await ctx.runQuery(async (ctx) => {
          return await getChannelById(ctx, mention.channelId);
        });

        if (channel) {
          channelName = channel.name;
        }
      }

      // Get the message if it exists
      let messagePreview = 'You were mentioned';
      if (mention.messageId) {
        const message = await ctx.runQuery(async (ctx) => {
          return await getMessageById(ctx, mention.messageId);
        });

        if (message) {
          messagePreview = extractMessageText(message.body);
        }
      } else if (mention.cardTitle) {
        messagePreview = `You were assigned to card: ${mention.cardTitle}`;
      }

      // Check if the mentioned user has an email
      if (!mentionedUser.email) {
        throw new Error('Mentioned user has no email');
      }

      // Send the email using the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: mentionedUser.email,
          recipientName: mentionedUser.name || 'User',
          mentionerName: mentionerUser.name || 'Someone',
          channelName,
          messagePreview,
          workspaceId: mention.workspaceId,
          channelId: mention.channelId || '',
          messageId: mention.messageId || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send mention email: ${errorData.error || 'Unknown error'}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending mention email:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});

// Send an email for a task assignment
export const sendTaskAssignmentEmail = action({
  args: {
    taskId: v.id('tasks'),
    assigneeUserId: v.id('users'),
    assignerMemberId: v.id('members'),
  },
  handler: async (ctx, args) => {
    try {
      // Get the task
      const task = await ctx.runQuery(async (ctx) => {
        return await ctx.db.get(args.taskId);
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Get the assignee user
      const assigneeUser = await ctx.runQuery(async (ctx) => {
        return await getUserById(ctx, args.assigneeUserId);
      });

      if (!assigneeUser) {
        throw new Error('Assignee user not found');
      }

      // Get the assigner member
      const assignerMember = await ctx.runQuery(async (ctx) => {
        return await getMemberById(ctx, args.assignerMemberId);
      });

      if (!assignerMember) {
        throw new Error('Assigner member not found');
      }

      // Get the assigner user
      const assignerUser = await ctx.runQuery(async (ctx) => {
        return await getUserById(ctx, assignerMember.userId);
      });

      if (!assignerUser) {
        throw new Error('Assigner user not found');
      }

      // Check if the assignee user has an email
      if (!assigneeUser.email) {
        throw new Error('Assignee user has no email');
      }

      // Format priority if it exists
      let priorityText = undefined;
      if (task.priority) {
        priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      }

      // Send the email using the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assignee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: assigneeUser.email,
          recipientName: assigneeUser.name || 'User',
          assignerName: assignerUser.name || 'Someone',
          taskTitle: task.title,
          taskDescription: task.description,
          dueDate: task.dueDate,
          priority: priorityText,
          workspaceId: task.workspaceId,
          taskId: task._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send task assignment email: ${errorData.error || 'Unknown error'}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending task assignment email:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});

// Send an email for a direct message
export const sendDirectMessageEmail = action({
  args: {
    messageId: v.id('messages'),
    recipientMemberId: v.id('members'),
  },
  handler: async (ctx, args) => {
    try {
      // Get the message
      const message = await ctx.runQuery(async (ctx) => {
        return await getMessageById(ctx, args.messageId);
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // Get the sender member
      const senderMember = await ctx.runQuery(async (ctx) => {
        return await getMemberById(ctx, message.memberId);
      });

      if (!senderMember) {
        throw new Error('Sender member not found');
      }

      // Get the recipient member
      const recipientMember = await ctx.runQuery(async (ctx) => {
        return await getMemberById(ctx, args.recipientMemberId);
      });

      if (!recipientMember) {
        throw new Error('Recipient member not found');
      }

      // Get the users
      const senderUser = await ctx.runQuery(async (ctx) => {
        return await getUserById(ctx, senderMember.userId);
      });

      const recipientUser = await ctx.runQuery(async (ctx) => {
        return await getUserById(ctx, recipientMember.userId);
      });

      if (!senderUser || !recipientUser) {
        throw new Error('User not found');
      }

      // Extract message preview
      const messagePreview = extractMessageText(message.body);

      // Check if the recipient user has an email
      if (!recipientUser.email) {
        throw new Error('Recipient user has no email');
      }

      // Send the email using the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: recipientUser.email,
          recipientName: recipientUser.name || 'User',
          senderName: senderUser.name || 'Someone',
          messagePreview,
          workspaceId: message.workspaceId,
          senderId: senderMember._id,
          messageId: message._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send direct message email: ${errorData.error || 'Unknown error'}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending direct message email:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});
