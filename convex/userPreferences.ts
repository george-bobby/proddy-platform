import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

/**
 * Update the last active workspace for a user
 */
export const updateLastActiveWorkspace = mutation({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Check if the user is a member of the workspace
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => 
        q.eq('workspaceId', args.workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member) {
      throw new Error('User is not a member of this workspace');
    }

    // Check if user preferences already exist
    const existingPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    const timestamp = Date.now();

    if (existingPrefs) {
      // Update existing preferences
      await ctx.db.patch(existingPrefs._id, {
        lastActiveWorkspaceId: args.workspaceId,
        lastActiveTimestamp: timestamp,
      });
    } else {
      // Create new preferences
      await ctx.db.insert('userPreferences', {
        userId,
        lastActiveWorkspaceId: args.workspaceId,
        lastActiveTimestamp: timestamp,
      });
    }

    return { success: true };
  },
});

/**
 * Get the last active workspace for a user
 */
export const getLastActiveWorkspace = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    // Get user preferences
    const userPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    if (!userPrefs || !userPrefs.lastActiveWorkspaceId) {
      return null;
    }

    // Verify the workspace still exists and the user is still a member
    const workspaceId = userPrefs.lastActiveWorkspaceId as Id<'workspaces'>;
    
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) {
      return null;
    }

    // Check if the user is still a member of this workspace
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => 
        q.eq('workspaceId', workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    return workspaceId;
  },
});

/**
 * Get all user preferences
 */
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    return await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();
  },
});

/**
 * Update user preferences
 */
export const updateUserPreferences = mutation({
  args: {
    settings: v.optional(
      v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Check if user preferences already exist
    const existingPrefs = await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    if (existingPrefs) {
      // Update existing preferences
      await ctx.db.patch(existingPrefs._id, {
        settings: args.settings,
      });
    } else {
      // Create new preferences
      await ctx.db.insert('userPreferences', {
        userId,
        settings: args.settings,
      });
    }

    return { success: true };
  },
});
