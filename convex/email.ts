import { v } from 'convex/values';

import type { Id, Doc } from './_generated/dataModel';
import {
  query,
  action,
  internalAction
} from './_generated/server';
import { api } from './_generated/api';

// Define types for our database documents
type User = Doc<"users">;
type Member = Doc<"members">;
type Channel = Doc<"channels">;
type Message = Doc<"messages">;
type Task = Doc<"tasks">;
type Card = Doc<"cards">;
type Mention = Doc<"mentions">;

// Define return types for our internal actions
interface MentionEmailData {
  mention: Mention;
  mentionedUser: User;
  mentionerUser: User;
  channelName: string;
  messagePreview: string;
}

interface TaskAssignmentEmailData {
  task: Task;
  assigneeUser: User;
  assignerUser: User;
  priorityText?: string;
}

interface DirectMessageEmailData {
  message: Message;
  senderMember: Member;
  recipientUser: User;
  senderUser: User;
  messagePreview: string;
}

// Define query functions for data retrieval
export const getMemberById = query({
  args: { memberId: v.id('members') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.memberId);
  },
});

export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getChannelById = query({
  args: { channelId: v.id('channels') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.channelId);
  },
});

export const getMessageById = query({
  args: { messageId: v.id('messages') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const getTaskById = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

export const getCardById = query({
  args: { cardId: v.id('cards') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.cardId);
  },
});

export const getMentionById = query({
  args: { mentionId: v.id('mentions') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mentionId);
  },
});

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

// Internal action for sending mention emails
export const _sendMentionEmail = internalAction({
  args: {
    mentionId: v.id('mentions'),
  },
  handler: async (ctx, args): Promise<MentionEmailData> => {
    try {
      // Get the mention
      const mention = await ctx.runQuery(api.email.getMentionById, { mentionId: args.mentionId }) as Mention;

      if (!mention) {
        throw new Error('Mention not found');
      }

      // Get the mentioned member
      const mentionedMember = await ctx.runQuery(api.email.getMemberById, { memberId: mention.mentionedMemberId }) as Member;

      if (!mentionedMember) {
        throw new Error('Mentioned member not found');
      }

      // Get the mentioner member
      const mentionerMember = await ctx.runQuery(api.email.getMemberById, { memberId: mention.mentionerMemberId }) as Member;

      if (!mentionerMember) {
        throw new Error('Mentioner member not found');
      }

      // Get the users
      const mentionedUser = await ctx.runQuery(api.email.getUserById, { userId: mentionedMember.userId }) as User;
      const mentionerUser = await ctx.runQuery(api.email.getUserById, { userId: mentionerMember.userId }) as User;

      if (!mentionedUser || !mentionerUser) {
        throw new Error('User not found');
      }

      // Get the channel if it exists
      let channelName = 'a conversation';
      if (mention.channelId) {
        const channel = await ctx.runQuery(api.email.getChannelById, { channelId: mention.channelId });

        if (channel) {
          channelName = channel.name;
        }
      }

      // Get the message if it exists
      let messagePreview = 'You were mentioned';
      if (mention.messageId) {
        const message = await ctx.runQuery(api.email.getMessageById, { messageId: mention.messageId }) as Message;

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

      return {
        mention,
        mentionedUser,
        mentionerUser,
        channelName,
        messagePreview
      };
    } catch (error) {
      console.error('Error preparing mention email data:', error);
      throw error;
    }
  },
});

// Public action for sending mention emails
export const sendMentionEmail = action({
  args: {
    mentionId: v.id('mentions'),
  },
  handler: async (ctx, args) => {
    try {
      // Prepare the data for the email
      const mention = await ctx.runQuery(api.email.getMentionById, { mentionId: args.mentionId }) as Mention;

      if (!mention) {
        throw new Error('Mention not found');
      }

      const mentionedMember = await ctx.runQuery(api.email.getMemberById, { memberId: mention.mentionedMemberId }) as Member;
      const mentionerMember = await ctx.runQuery(api.email.getMemberById, { memberId: mention.mentionerMemberId }) as Member;
      const mentionedUser = await ctx.runQuery(api.email.getUserById, { userId: mentionedMember.userId }) as User;
      const mentionerUser = await ctx.runQuery(api.email.getUserById, { userId: mentionerMember.userId }) as User;

      // Get the channel if it exists
      let channelName = 'a conversation';
      if (mention.channelId) {
        const channel = await ctx.runQuery(api.email.getChannelById, { channelId: mention.channelId });
        if (channel) {
          channelName = channel.name;
        }
      }

      // Get the message if it exists
      let messagePreview = 'You were mentioned';
      if (mention.messageId) {
        const message = await ctx.runQuery(api.email.getMessageById, { messageId: mention.messageId }) as Message;
        if (message) {
          messagePreview = extractMessageText(message.body);
        }
      } else if (mention.cardTitle) {
        messagePreview = `You were assigned to card: ${mention.cardTitle}`;
      }

      // Send the email using the API
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy-platform.vercel.app';
      const response = await fetch(`${appUrl}/api/mention`, {
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

// Internal action for task assignment emails
export const _sendTaskAssignmentEmail = internalAction({
  args: {
    taskId: v.id('tasks'),
    assigneeUserId: v.id('users'),
    assignerMemberId: v.id('members'),
  },
  handler: async (ctx, args): Promise<TaskAssignmentEmailData> => {
    try {
      // Get the task
      const task = await ctx.runQuery(api.email.getTaskById, { taskId: args.taskId }) as Task;

      if (!task) {
        throw new Error('Task not found');
      }

      // Get the assignee user
      const assigneeUser = await ctx.runQuery(api.email.getUserById, { userId: args.assigneeUserId }) as User;

      if (!assigneeUser) {
        throw new Error('Assignee user not found');
      }

      // Get the assigner member
      const assignerMember = await ctx.runQuery(api.email.getMemberById, { memberId: args.assignerMemberId }) as Member;

      if (!assignerMember) {
        throw new Error('Assigner member not found');
      }

      // Get the assigner user
      const assignerUser = await ctx.runQuery(api.email.getUserById, { userId: assignerMember.userId }) as User;

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

      return {
        task,
        assigneeUser,
        assignerUser,
        priorityText
      };
    } catch (error) {
      console.error('Error preparing task assignment email data:', error);
      throw error;
    }
  },
});

// Public action for task assignment emails
export const sendTaskAssignmentEmail = action({
  args: {
    taskId: v.id('tasks'),
    assigneeUserId: v.id('users'),
    assignerMemberId: v.id('members'),
  },
  handler: async (ctx, args) => {
    try {
      // Prepare the data for the email
      const task = await ctx.runQuery(api.email.getTaskById, { taskId: args.taskId }) as Task;

      if (!task) {
        throw new Error('Task not found');
      }

      const assigneeUser = await ctx.runQuery(api.email.getUserById, { userId: args.assigneeUserId }) as User;
      const assignerMember = await ctx.runQuery(api.email.getMemberById, { memberId: args.assignerMemberId }) as Member;
      const assignerUser = await ctx.runQuery(api.email.getUserById, { userId: assignerMember.userId }) as User;

      // Format priority if it exists
      let priorityText = undefined;
      if (task.priority) {
        priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      }

      // Send the email using the API
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy-platform.vercel.app';
      const response = await fetch(`${appUrl}/api/assignee`, {
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

// Internal action for direct message emails
export const _sendDirectMessageEmail = internalAction({
  args: {
    messageId: v.id('messages'),
    recipientMemberId: v.id('members'),
  },
  handler: async (ctx, args): Promise<DirectMessageEmailData> => {
    try {
      // Get the message
      const message = await ctx.runQuery(api.email.getMessageById, { messageId: args.messageId }) as Message;

      if (!message) {
        throw new Error('Message not found');
      }

      // Get the sender member
      const senderMember = await ctx.runQuery(api.email.getMemberById, { memberId: message.memberId }) as Member;

      if (!senderMember) {
        throw new Error('Sender member not found');
      }

      // Get the recipient member
      const recipientMember = await ctx.runQuery(api.email.getMemberById, { memberId: args.recipientMemberId }) as Member;

      if (!recipientMember) {
        throw new Error('Recipient member not found');
      }

      // Get the users
      const senderUser = await ctx.runQuery(api.email.getUserById, { userId: senderMember.userId }) as User;
      const recipientUser = await ctx.runQuery(api.email.getUserById, { userId: recipientMember.userId }) as User;

      if (!senderUser || !recipientUser) {
        throw new Error('User not found');
      }

      // Extract message preview
      const messagePreview = extractMessageText(message.body);

      // Check if the recipient user has an email
      if (!recipientUser.email) {
        throw new Error('Recipient user has no email');
      }

      return {
        message,
        senderMember,
        recipientUser,
        senderUser,
        messagePreview
      };
    } catch (error) {
      console.error('Error preparing direct message email data:', error);
      throw error;
    }
  },
});

// Public action for direct message emails
export const sendDirectMessageEmail = action({
  args: {
    messageId: v.id('messages'),
    recipientMemberId: v.id('members'),
  },
  handler: async (ctx, args) => {
    try {
      // Prepare the data for the email
      const message = await ctx.runQuery(api.email.getMessageById, { messageId: args.messageId }) as Message;

      if (!message) {
        throw new Error('Message not found');
      }

      const senderMember = await ctx.runQuery(api.email.getMemberById, { memberId: message.memberId }) as Member;
      const recipientMember = await ctx.runQuery(api.email.getMemberById, { memberId: args.recipientMemberId }) as Member;
      const senderUser = await ctx.runQuery(api.email.getUserById, { userId: senderMember.userId }) as User;
      const recipientUser = await ctx.runQuery(api.email.getUserById, { userId: recipientMember.userId }) as User;

      // Extract message preview
      const messagePreview = extractMessageText(message.body);

      // Send the email using the API
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy-platform.vercel.app';
      const response = await fetch(`${appUrl}/api/direct`, {
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
