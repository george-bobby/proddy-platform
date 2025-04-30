import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

/**
 * Initialize a new user with default active status
 * This should be called when a new user is created
 */
export const initializeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Get the current user
    const user = await ctx.db.get(userId as Id<'users'>);

    if (!user) throw new Error('User not found');

    // Only set active status if it's not already set
    if (user.active === undefined) {
      await ctx.db.patch(userId as Id<'users'>, {
        active: 'no',
      });
    }

    return { success: true };
  },
});

/**
 * Set a user's active status to "yes" when they log in
 */
export const setActive = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Get the current user
    const user = await ctx.db.get(userId as Id<'users'>);

    if (!user) throw new Error('User not found');

    // Update the user's active status to "yes"
    await ctx.db.patch(userId as Id<'users'>, {
      active: 'yes',
    });

    return { success: true };
  },
});

/**
 * Set a user's active status to "no" when they log out
 */
export const setInactive = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Update the user's active status to "no"
    await ctx.db.patch(userId as Id<'users'>, {
      active: 'no',
    });

    return { success: true };
  },
});

/**
 * Get a user's active status
 */
export const getStatus = query({
  args: {
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // If userId is provided, get that user's status
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      return user?.active || 'no';
    }

    // Otherwise, get the current user's status
    const userId = await getAuthUserId(ctx);
    if (!userId) return 'no';

    const user = await ctx.db.get(userId as Id<'users'>);
    return user?.active || 'no';
  },
});

/**
 * Get all active users
 */
export const getActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('active'), 'yes'))
      .collect();

    return users;
  },
});
