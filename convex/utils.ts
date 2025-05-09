import { type QueryCtx } from './_generated/server';
import { Id } from './_generated/dataModel';

// Helper function to get a member by workspace and user ID
export const getMember = async (ctx: QueryCtx, workspaceId: Id<'workspaces'>, userId: Id<'users'>) => {
  return await ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
    .unique();
};

// Helper function to populate user data for a member
export const populateUser = async (ctx: QueryCtx, userId: Id<'users'>) => {
  return await ctx.db.get(userId);
};

// Helper function to populate member data
export const populateMember = async (ctx: QueryCtx, memberId: Id<'members'>) => {
  const member = await ctx.db.get(memberId);
  if (!member) return null;

  const user = await populateUser(ctx, member.userId);
  if (!user) return null;

  return {
    ...member,
    user,
  };
};

// Helper function to get channel data
export const getChannel = async (ctx: QueryCtx, channelId: Id<'channels'>) => {
  return await ctx.db.get(channelId);
};

// Helper function to get conversation data
export const getConversation = async (ctx: QueryCtx, conversationId: Id<'conversations'>) => {
  return await ctx.db.get(conversationId);
};

// Helper function to get message data
export const getMessage = async (ctx: QueryCtx, messageId: Id<'messages'>) => {
  return await ctx.db.get(messageId);
};
