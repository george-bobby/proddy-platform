import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { query } from './_generated/server';

export const current = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);

		if (userId === null) return null;

		return await ctx.db.get(userId);
	},
});

export const getUserById = query({
	args: {
		id: v.id('users'),
	},
	handler: async (ctx, args) => {
		// Get the authenticated user ID
		const authUserId = await getAuthUserId(ctx);

		// Only allow authenticated users to access user data
		if (!authUserId) return null;

		// Get the requested user
		const user = await ctx.db.get(args.id);

		if (!user) return null;

		// Return the user data
		return user;
	},
});
