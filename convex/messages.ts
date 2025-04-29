import { getAuthUserId } from '@convex-dev/auth/server';
import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import type { Doc, Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';

const populateThread = async (ctx: QueryCtx, messageId: Id<'messages'>) => {
  const messages = await ctx.db
    .query('messages')
    .withIndex('by_parent_message_id', (q) => q.eq('parentMessageId', messageId))
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: '',
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: '',
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name,
  };
};

const populateReactions = (ctx: QueryCtx, messageId: Id<'messages'>) => {
  return ctx.db
    .query('reactions')
    .withIndex('by_message_id', (q) => q.eq('messageId', messageId))
    .collect();
};

const populateUser = (ctx: QueryCtx, userId: Id<'users'>) => {
  return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<'members'>) => {
  return ctx.db.get(memberId);
};

const getMember = async (ctx: QueryCtx, workspaceId: Id<'workspaces'>, userId: Id<'users'>) => {
  return await ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
    .unique();
};

export const get = query({
  args: {
    channelId: v.optional(v.id('channels')),
    conversationId: v.optional(v.id('conversations')),
    parentMessageId: v.optional(v.id('messages')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    let _conversationId = args.conversationId;

    // replying in a thread in 1-1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) throw new Error('Parent message not found.');

      _conversationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query('messages')
      .withIndex('by_channel_id_parent_message_id_conversation_id', (q) =>
        q.eq('channelId', args.channelId).eq('parentMessageId', args.parentMessageId).eq('conversationId', _conversationId),
      )
      .order('desc')
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member?.userId) : null;

            if (!member || !user) return null;

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThread(ctx, message._id);
            const image = message.image ? await ctx.storage.getUrl(message.image) : undefined;

            const reactionsWithCounts = reactions.map((reaction) => ({
              ...reaction,
              count: reactions.filter((r) => r.value === reaction.value).length,
            }));

            const dedupedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find((r) => r.value === reaction.value);

                if (existingReaction) {
                  existingReaction.memberIds = Array.from(new Set([...existingReaction.memberIds, reaction.memberId]));
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }

                return acc;
              },
              [] as (Doc<'reactions'> & {
                count: number;
                memberIds: Id<'members'>[];
              })[],
            );

            const reactionsWithoutMemberIdProperty = dedupedReactions.map(({ memberId, ...rest }) => rest);

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count,
              threadImage: thread.image,
              threadName: thread.name,
              threadTimestamp: thread.timestamp,
            };
          }),
        )
      ).filter((message): message is NonNullable<typeof message> => message !== null),
    };
  },
});

export const getById = query({
  args: {
    id: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    const message = await ctx.db.get(args.id);

    if (!message) return null;

    const currentMember = await getMember(ctx, message.workspaceId, userId as Id<'users'>);

    if (!currentMember) return null;

    const member = await populateMember(ctx, message.memberId);

    if (!member) return null;

    const user = await populateUser(ctx, member.userId);

    if (!user) return null;

    const reactions = await populateReactions(ctx, message._id);

    const reactionsWithCounts = reactions.map((reaction) => ({
      ...reaction,
      count: reactions.filter((r) => r.value === reaction.value).length,
    }));

    const dedupedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);

        if (existingReaction) {
          existingReaction.memberIds = Array.from(new Set([...existingReaction.memberIds, reaction.memberId]));
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }

        return acc;
      },
      [] as (Doc<'reactions'> & {
        count: number;
        memberIds: Id<'members'>[];
      })[],
    );

    const reactionsWithoutMemberIdProperty = dedupedReactions.map(({ memberId, ...rest }) => rest);

    return {
      ...message,
      image: message.image ? await ctx.storage.getUrl(message.image) : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberIdProperty,
    };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id('_storage')),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    conversationId: v.optional(v.id('conversations')),
    parentMessageId: v.optional(v.id('messages')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await getMember(ctx, args.workspaceId, userId as Id<'users'>);

    if (!member) throw new Error('Unauthorized.');

    let _conversationId = args.conversationId;

    // replying in a thread in 1-1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) throw new Error('Parent message not found.');

      _conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert('messages', {
      memberId: member._id,
      body: args.body,
      image: args.image,
      channelId: args.channelId,
      workspaceId: args.workspaceId,
      conversationId: _conversationId,
      parentMessageId: args.parentMessageId,
    });

    return messageId;
  },
});

export const update = mutation({
  args: {
    id: v.id('messages'),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const message = await ctx.db.get(args.id);

    if (!message) throw new Error('Message not found.');

    const member = await getMember(ctx, message.workspaceId, userId as Id<'users'>);

    if (!member || member._id !== message.memberId) throw new Error('Unauthorized.');

    await ctx.db.patch(args.id, {
      body: args.body,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id('messages'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const message = await ctx.db.get(args.id);

    if (!message) throw new Error('Message not found.');

    const member = await getMember(ctx, message.workspaceId, userId as Id<'users'>);

    if (!member || member._id !== message.memberId) throw new Error('Unauthorized.');

    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const getUserMessages = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error('Not authenticated');
      }

      const userId = identity.subject;
      const baseUserId = userId.split('|')[0];

      // First check if the workspace exists
      const workspace = await ctx.db.get(args.workspaceId);
      if (!workspace) {
        return [];
      }

      // Get the current member using the base user ID
      const currentMember = await ctx.db
        .query('members')
        .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', baseUserId as Id<'users'>))
        .unique();

      // If no member found, return empty array
      if (!currentMember) {
        return [];
      }

      // Get all messages for the current member in this workspace
      const messages = await ctx.db
        .query('messages')
        .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
        .filter((q) => q.eq(q.field('memberId'), currentMember._id))
        .order('desc')
        .collect();

      // Get channel and conversation information for each message
      const messagesWithContext = await Promise.all(
        messages.map(async (message) => {
          let context: {
            name: string;
            type: 'channel' | 'conversation' | 'unknown';
            id: Id<'channels'> | Id<'conversations'>;
            memberId?: Id<'members'>;
          } = {
            name: 'Unknown',
            type: 'unknown',
            id: message.channelId || message.conversationId || ('' as Id<'channels'> | Id<'conversations'>),
          };

          if (message.channelId) {
            const channel = await ctx.db.get(message.channelId);
            if (channel) {
              context = {
                name: channel.name,
                type: 'channel',
                id: channel._id,
              };
            }
          } else if (message.conversationId) {
            const conversation = await ctx.db.get(message.conversationId);
            if (conversation) {
              const otherMemberId = conversation.memberOneId === currentMember._id ? conversation.memberTwoId : conversation.memberOneId;
              const otherMember = await ctx.db.get(otherMemberId);
              if (otherMember) {
                const otherUser = await ctx.db.get(otherMember.userId);
                if (otherUser) {
                  context = {
                    name: `Direct Message with ${otherUser.name}`,
                    type: 'conversation',
                    id: conversation._id,
                    memberId: otherMember._id,
                  };
                }
              }
            }
          }

          return {
            ...message,
            context,
          };
        }),
      );

      return messagesWithContext;
    } catch (error) {
      throw error;
    }
  },
});

export const getAllWorkspaceMessages = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error('Not authenticated');
      }

      // Get all messages in the workspace
      const allMessages = await ctx.db
        .query('messages')
        .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
        .collect();

      console.log('getAllWorkspaceMessages - total messages:', allMessages.length);
      console.log('getAllWorkspaceMessages - messages:', allMessages);

      // Get all members in the workspace
      const members = await ctx.db
        .query('members')
        .filter((q) => q.eq(q.field('workspaceId'), args.workspaceId))
        .collect();

      console.log('getAllWorkspaceMessages - members:', members);

      return {
        messages: allMessages,
        members,
      };
    } catch (error) {
      console.error('getAllWorkspaceMessages - Error:', error);
      throw error;
    }
  },
});
