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
      .query('history')
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
      await ctx.db.insert('history', {
        userId,
        workspaceId: args.workspaceId,
        status: args.status,
        lastSeen: Date.now(),
      });
    }

    return { success: true };
  },
});

// Mark user as offline across all workspaces (called on logout)
export const markUserOfflineGlobally = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return { success: false };

    // Get all status entries for this user across all workspaces
    const userStatuses = await ctx.db
      .query('history')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    // Update all entries to offline
    const updatePromises = userStatuses.map(status =>
      ctx.db.patch(status._id, {
        status: 'offline',
        lastSeen: Date.now(),
      })
    );

    await Promise.all(updatePromises);

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
      .query('history')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    // Apply the same logic as getUserStatus to determine effective status
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

    return statusEntries.map(s => {
      const isRecentlyActive = s.lastSeen > twoMinutesAgo;
      const effectiveStatus = s.status === 'online' && !isRecentlyActive ? 'offline' : s.status;

      return {
        userId: s.userId,
        status: effectiveStatus,
        lastSeen: s.lastSeen,
      };
    });
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
    // We can safely use args.userId here because we've already checked that it exists
    const userId = args.userId; // This helps TypeScript understand that userId is defined
    const status = await ctx.db
      .query('history')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
      .unique();

    if (!status) return { status: 'offline', lastSeen: 0 };

    // Check if the user is still authenticated by looking for recent activity
    // If the last seen time is more than 2 minutes ago, consider them potentially logged out
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const isRecentlyActive = status.lastSeen > twoMinutesAgo;

    // If status is online but user hasn't been active recently, mark as offline
    const effectiveStatus = status.status === 'online' && !isRecentlyActive ? 'offline' : status.status;

    return {
      status: effectiveStatus,
      lastSeen: status.lastSeen,
    };
  },
});
