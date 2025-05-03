import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';

const getMember = async (ctx: QueryCtx, workspaceId: Id<'workspaces'>, userId: Id<'users'>) => {
  return await ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
    .unique();
};

export const createCalendarEvent = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    time: v.optional(v.string()),
    messageId: v.id('messages'),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await getMember(ctx, args.workspaceId, userId as Id<'users'>);

    if (!member) throw new Error('Member not found.');

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error('Message not found.');

    // Update the message with calendar event info
    await ctx.db.patch(args.messageId, {
      calendarEvent: {
        date: args.date,
        time: args.time,
      },
    });

    // Create a calendar event
    const calendarEventId = await ctx.db.insert('calendarEvents', {
      title: args.title,
      date: args.date,
      time: args.time,
      messageId: args.messageId,
      memberId: member._id,
      workspaceId: args.workspaceId,
    });

    return calendarEventId;
  },
});

export const getCalendarEvents = query({
  args: {
    workspaceId: v.id('workspaces'),
    month: v.number(), // Month number (0-11)
    year: v.number(),  // Year (e.g., 2023)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await getMember(ctx, args.workspaceId, userId as Id<'users'>);

    if (!member) throw new Error('Member not found.');

    // Calculate start and end timestamps for the month
    const startDate = new Date(args.year, args.month, 1).getTime();
    const endDate = new Date(args.year, args.month + 1, 0, 23, 59, 59).getTime();

    // Get all calendar events for the month
    const events = await ctx.db
      .query('calendarEvents')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .filter((q) => q.and(q.gte(q.field('date'), startDate), q.lte(q.field('date'), endDate)))
      .collect();

    // Get all messages with calendar events
    const messageIds = events.map((event) => event.messageId);
    const messages = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await ctx.db.get(messageId);
        return message;
      })
    );

    // Get all members
    const memberIds = messages.map((message) => message?.memberId).filter(Boolean) as Id<'members'>[];
    // Convert Set to Array explicitly to avoid TypeScript iteration error
    const uniqueMemberIds = Array.from(new Set(memberIds));
    const members = await Promise.all(
      uniqueMemberIds.map(async (memberId) => {
        const member = await ctx.db.get(memberId);
        return member;
      })
    );

    // Get all users
    const userIds = members.map((member) => member?.userId).filter(Boolean) as Id<'users'>[];
    // Convert Set to Array explicitly to avoid TypeScript iteration error
    const uniqueUserIds = Array.from(new Set(userIds));
    const users = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user;
      })
    );

    // Create a map of user ID to user
    const userMap = new Map(users.map((user) => [user?._id, user]));
    // Create a map of member ID to member
    const memberMap = new Map(members.map((member) => [member?._id, member]));
    // Create a map of message ID to message
    const messageMap = new Map(messages.map((message) => [message?._id, message]));

    // Map events to include message and user info
    return events.map((event) => {
      const message = messageMap.get(event.messageId);
      const member = message ? memberMap.get(message.memberId) : null;
      const user = member ? userMap.get(member.userId) : null;

      return {
        ...event,
        message: message ? {
          _id: message._id,
          body: message.body,
          _creationTime: message._creationTime,
          channelId: message.channelId,
          conversationId: message.conversationId,
          calendarEvent: message.calendarEvent,
        } : null,
        user: user ? {
          _id: user._id,
          name: user.name,
          image: user.image,
        } : null,
      };
    });
  },
});

export const getMessagesWithCalendarEvents = query({
  args: {
    workspaceId: v.id('workspaces'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await getMember(ctx, args.workspaceId, userId as Id<'users'>);

    if (!member) throw new Error('Member not found.');

    // Get all messages with calendar events
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .filter((q) => q.neq(q.field('calendarEvent'), undefined))
      .paginate(args.paginationOpts);

    // Get all members
    const memberIds = messages.page.map((message) => message.memberId);
    // Convert Set to Array explicitly to avoid TypeScript iteration error
    const uniqueMemberIds = Array.from(new Set(memberIds));
    const members = await Promise.all(
      uniqueMemberIds.map(async (memberId) => {
        const member = await ctx.db.get(memberId);
        return member;
      })
    );

    // Get all users
    const userIds = members.map((member) => member?.userId).filter(Boolean) as Id<'users'>[];
    // Convert Set to Array explicitly to avoid TypeScript iteration error
    const uniqueUserIds = Array.from(new Set(userIds));
    const users = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return user;
      })
    );

    // Create a map of user ID to user
    const userMap = new Map(users.map((user) => [user?._id, user]));
    // Create a map of member ID to member
    const memberMap = new Map(members.map((member) => [member?._id, member]));

    // Map messages to include user info
    const messagesWithUsers = messages.page.map((message) => {
      const member = memberMap.get(message.memberId);
      const user = member ? userMap.get(member.userId) : null;

      return {
        ...message,
        user: user ? {
          _id: user._id,
          name: user.name,
          image: user.image,
        } : null,
      };
    });

    return {
      ...messages,
      page: messagesWithUsers,
    };
  },
});
