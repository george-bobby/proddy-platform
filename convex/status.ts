import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';

// Update user status (online/offline)
export const update = mutation({
  args: {
    status: v.string(),
    workspaceId: v.id('workspaces')
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    // Check if the user is a member of the workspace
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
      .unique();

    if (!member) throw new Error('Not a member of this workspace.');

    // Check if there's an existing status entry
    const existing = await ctx.db
      .query('userStatus')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
      .unique();

    if (existing) {
      // Update existing status
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastSeen: Date.now(),
      });
    } else {
      // Create new status entry
      await ctx.db.insert('userStatus', {
        userId,
        workspaceId: args.workspaceId,
        status: args.status,
        lastSeen: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get status for all users in a workspace
export const getForWorkspace = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    // Check if the user is a member of the workspace
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
      .unique();

    if (!member) return [];

    // Get all status entries for the workspace
    const statusEntries = await ctx.db
      .query('userStatus')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    return statusEntries.map(s => ({
      userId: s.userId,
      status: s.status,
      lastSeen: s.lastSeen,
    }));
  },
});

// Get status for a specific user in a workspace
export const getUserStatus = query({
  args: {
    workspaceId: v.id('workspaces'),
    userId: v.optional(v.id('users'))
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) return null;

    // Check if the current user is a member of the workspace
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId))
      .unique();

    if (!member) return null;

    // If no userId is provided, return default offline status
    if (!args.userId) return { status: 'offline', lastSeen: 0 };

    // Get status for the specified user
    const status = await ctx.db
      .query('userStatus')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', args.userId))
      .unique();

    if (!status) return { status: 'offline', lastSeen: 0 };

    return {
      status: status.status,
      lastSeen: status.lastSeen,
    };
  },
});
