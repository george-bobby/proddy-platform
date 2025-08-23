import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { query, mutation } from './_generated/server';

export const current = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);

		if (userId === null) return null;

		const user = await ctx.db.get(userId);
		if (!user) return null;

		// Get image URL if user has an image
		// Check if it's a storage ID or external URL
		let imageUrl: string | undefined = undefined;
		if (user.image) {
			// If it starts with http, it's an external URL (from OAuth providers)
			if (user.image.startsWith('http')) {
				imageUrl = user.image;
			} else {
				// Otherwise, it's a Convex storage ID
				imageUrl = (await ctx.storage.getUrl(user.image)) || undefined;
			}
		}

		return {
			...user,
			image: imageUrl,
		};
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

		// Get image URL if user has an image
		// Check if it's a storage ID or external URL
		let imageUrl: string | undefined = undefined;
		if (user.image) {
			// If it starts with http, it's an external URL (from OAuth providers)
			if (user.image.startsWith('http')) {
				imageUrl = user.image;
			} else {
				// Otherwise, it's a Convex storage ID
				imageUrl = (await ctx.storage.getUrl(user.image)) || undefined;
			}
		}

		// Return the user data with image URL
		return {
			...user,
			image: imageUrl,
		};
	},
});

/**
 * Update user profile information
 */
export const updateProfile = mutation({
	args: {
		name: v.optional(v.string()),
		bio: v.optional(v.string()),
		location: v.optional(v.string()),
		website: v.optional(v.string()),
		phone: v.optional(v.string()),
		image: v.optional(v.id('_storage')),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		// Get current user to verify it exists
		const currentUser = await ctx.db.get(userId);
		if (!currentUser) {
			throw new Error('User not found');
		}

		// Prepare update data, filtering out undefined values
		const updateData: Record<string, any> = {};

		if (args.name !== undefined) {
			updateData.name = args.name.trim();
		}
		if (args.bio !== undefined) {
			updateData.bio = args.bio.trim() || undefined;
		}
		if (args.location !== undefined) {
			updateData.location = args.location.trim() || undefined;
		}
		if (args.website !== undefined) {
			updateData.website = args.website.trim() || undefined;
		}
		if (args.phone !== undefined) {
			updateData.phone = args.phone.trim() || undefined;
		}
		if (args.image !== undefined) {
			updateData.image = args.image;
		}

		// Update the user
		await ctx.db.patch(userId, updateData);

		return { success: true };
	},
});
