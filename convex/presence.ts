import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';
import { getMember } from './utils';

// Update user presence in a channel
export const updatePresence = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    channelId: v.id('channels'),
    status: v.union(v.literal('active'), v.literal('inactive')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error('Not a member of this workspace');

    // Check if there's an existing presence entry
    const existing = await ctx.db
      .query('presence')
      .withIndex('by_user_channel', (q) => 
        q.eq('userId', userId)
         .eq('channelId', args.channelId)
      )
      .unique();

    const timestamp = Date.now();

    if (existing) {
      // Update existing presence
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastUpdated: timestamp,
      });
    } else {
      // Create new presence entry
      await ctx.db.insert('presence', {
        userId,
        workspaceId: args.workspaceId,
        channelId: args.channelId,
        status: args.status,
        lastUpdated: timestamp,
      });
    }

    return { success: true };
  },
});

// Get active users in a channel
export const getActiveUsers = query({
  args: {
    workspaceId: v.id('workspaces'),
    channelId: v.id('channels'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) return [];

    // Get all active users in the channel
    // Consider users active if they've updated their presence in the last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const activePresences = await ctx.db
      .query('presence')
      .withIndex('by_channel_status', (q) => 
        q.eq('channelId', args.channelId)
         .eq('status', 'active')
      )
      .filter((q) => q.gt(q.field('lastUpdated'), fiveMinutesAgo))
      .collect();

    // Return user IDs and last updated timestamps
    return activePresences.map(presence => ({
      userId: presence.userId,
      lastUpdated: presence.lastUpdated,
    }));
  },
});

// Clean up inactive presences (can be called periodically)
export const cleanupInactivePresences = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    // Consider users inactive if they haven't updated their presence in the last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    
    // Find all presence entries that haven't been updated recently
    const inactivePresences = await ctx.db
      .query('presence')
      .filter((q) => q.lt(q.field('lastUpdated'), tenMinutesAgo))
      .collect();
    
    // Update all inactive presences
    for (const presence of inactivePresences) {
      await ctx.db.patch(presence._id, {
        status: 'inactive',
      });
    }
    
    return { 
      success: true,
      cleanedCount: inactivePresences.length 
    };
  },
});
