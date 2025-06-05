import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import {
	type QueryCtx,
	mutation,
	query,
	internalMutation,
} from './_generated/server';

// Unified presence/status update (handles both workspace and channel level)
export const update = mutation({
	args: {
		status: v.string(),
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')), // Optional for channel-specific presence
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		// Check if user has status tracking enabled
		const userPrefs = await ctx.db
			.query('userPreferences')
			.withIndex('by_user_id', (q) => q.eq('userId', userId))
			.unique();

		const statusTrackingEnabled = userPrefs?.settings?.statusTracking ?? true;

		// If status tracking is disabled, don't update status
		if (!statusTrackingEnabled) {
			return {
				success: true,
				updated: false,
				reason: 'Status tracking disabled',
			};
		}

		// Check if the user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) throw new Error('Not a member of this workspace.');

		// Check if there's an existing status entry
		const existing = await ctx.db
			.query('history')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		const now = Date.now();

		if (existing) {
			// Smart update: Only update if status changed OR if it's been more than 2 minutes since last update
			const timeSinceLastUpdate = now - existing.lastSeen;
			const statusChanged = existing.status !== args.status;
			const shouldUpdate = statusChanged || timeSinceLastUpdate > 2 * 60 * 1000;

			if (shouldUpdate) {
				await ctx.db.patch(existing._id, {
					status: args.status,
					lastSeen: now,
					channelId: args.channelId || existing.channelId, // Preserve or update channel
				});
				return { success: true, updated: true };
			} else {
				// Skip update to save resources
				return { success: true, updated: false, reason: 'No update needed' };
			}
		} else {
			// Create new status entry
			await ctx.db.insert('history', {
				userId,
				workspaceId: args.workspaceId,
				channelId: args.channelId, // undefined for workspace-level
				status: args.status,
				lastSeen: now,
			});
			return { success: true, updated: true };
		}
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
		const updatePromises = userStatuses.map((status) =>
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
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) return [];

		// Get all status entries for the workspace
		const statusEntries = await ctx.db
			.query('history')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Get all user preferences to check who has status tracking enabled
		const userIds = statusEntries.map((s) => s.userId);
		const userPreferences = await Promise.all(
			userIds.map(async (uid) => {
				const prefs = await ctx.db
					.query('userPreferences')
					.withIndex('by_user_id', (q) => q.eq('userId', uid))
					.unique();
				return {
					userId: uid,
					statusTrackingEnabled: prefs?.settings?.statusTracking ?? true,
				};
			})
		);

		const prefsMap = userPreferences.reduce(
			(acc, pref) => {
				acc[pref.userId] = pref.statusTrackingEnabled;
				return acc;
			},
			{} as Record<string, boolean>
		);

		// Apply 4-state status logic to all entries
		return statusEntries.map((s) => {
			// Check if user has status tracking disabled
			if (prefsMap[s.userId] === false) {
				return {
					userId: s.userId,
					status: 'privacy', // White - status tracking disabled
					lastSeen: s.lastSeen,
				};
			}

			// Apply 4-state logic for users with tracking enabled
			const now = Date.now();
			const twoMinutesAgo = now - 2 * 60 * 1000;
			const fiveMinutesAgo = now - 5 * 60 * 1000;
			const isRecentlyActive = s.lastSeen > twoMinutesAgo;
			const isRecentlyOnline = s.lastSeen > fiveMinutesAgo;

			let effectiveStatus: string;
			if (s.status === 'online' && isRecentlyActive) {
				effectiveStatus = 'online'; // Green - currently online
			} else if (s.status === 'online' && isRecentlyOnline) {
				effectiveStatus = 'recently_online'; // Grey - was online recently
			} else {
				effectiveStatus = 'offline'; // Red - offline or inactive
			}

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
		userId: v.optional(v.id('users')),
	},
	handler: async (ctx, args) => {
		const currentUserId = await getAuthUserId(ctx);

		if (!currentUserId) return null;

		// Check if the current user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId)
			)
			.unique();

		if (!member) return null;

		// If no userId is provided, return default offline status
		if (!args.userId) return { status: 'offline', lastSeen: 0 };

		// Check if the target user has status tracking enabled
		const userId = args.userId;
		const userPrefs = await ctx.db
			.query('userPreferences')
			.withIndex('by_user_id', (q) => q.eq('userId', userId))
			.unique();

		const statusTrackingEnabled = userPrefs?.settings?.statusTracking ?? true;

		// If the target user has disabled status tracking, return privacy status
		if (!statusTrackingEnabled) {
			return { status: 'privacy', lastSeen: 0 };
		}

		// Get status for the specified user
		const status = await ctx.db
			.query('history')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!status) return { status: 'offline', lastSeen: 0 };

		// Check if the user is still authenticated by looking for recent activity
		const now = Date.now();
		const twoMinutesAgo = now - 2 * 60 * 1000;
		const fiveMinutesAgo = now - 5 * 60 * 1000;
		const isRecentlyActive = status.lastSeen > twoMinutesAgo;
		const isRecentlyOnline = status.lastSeen > fiveMinutesAgo;

		// Determine effective status with 4 states
		let effectiveStatus: string;
		if (status.status === 'online' && isRecentlyActive) {
			effectiveStatus = 'online'; // Green - currently online
		} else if (status.status === 'online' && isRecentlyOnline) {
			effectiveStatus = 'recently_online'; // Grey - was online recently (2-5 min ago)
		} else {
			effectiveStatus = 'offline'; // Red - offline or inactive for >5 min
		}

		return {
			status: effectiveStatus,
			lastSeen: status.lastSeen,
		};
	},
});

// ===== CHANNEL-SPECIFIC PRESENCE FUNCTIONS =====

// Get active users in a specific channel
export const getChannelPresence = query({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		// Check workspace membership
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) return [];

		// Get channel-specific presence (last 5 minutes)
		const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

		const channelPresences = await ctx.db
			.query('history')
			.withIndex('by_workspace_channel', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('channelId', args.channelId)
			)
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field('status'), 'active'),
						q.eq(q.field('status'), 'online')
					),
					q.gt(q.field('lastSeen'), fiveMinutesAgo)
				)
			)
			.collect();

		// Filter by privacy preferences
		const results = [];
		for (const presence of channelPresences) {
			const userPrefs = await ctx.db
				.query('userPreferences')
				.withIndex('by_user_id', (q) => q.eq('userId', presence.userId))
				.unique();

			const statusTrackingEnabled = userPrefs?.settings?.statusTracking ?? true;
			if (statusTrackingEnabled) {
				results.push({
					userId: presence.userId,
					status: presence.status,
					lastSeen: presence.lastSeen,
				});
			}
		}

		return results;
	},
});

// Update channel-specific presence (active/inactive)
export const updateChannelPresence = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
		status: v.union(v.literal('active'), v.literal('inactive')),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized.');

		// Check if user has status tracking enabled
		const userPrefs = await ctx.db
			.query('userPreferences')
			.withIndex('by_user_id', (q) => q.eq('userId', userId))
			.unique();

		const statusTrackingEnabled = userPrefs?.settings?.statusTracking ?? true;
		if (!statusTrackingEnabled) {
			return {
				success: true,
				updated: false,
				reason: 'Status tracking disabled',
			};
		}

		// Check workspace membership
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) throw new Error('Not a member of this workspace.');

		// Find existing channel presence entry
		const existing = await ctx.db
			.query('history')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.filter((q) => q.eq(q.field('channelId'), args.channelId))
			.first();

		const now = Date.now();

		if (existing) {
			await ctx.db.patch(existing._id, {
				status: args.status,
				lastSeen: now,
			});
		} else {
			await ctx.db.insert('history', {
				userId,
				workspaceId: args.workspaceId,
				channelId: args.channelId,
				status: args.status,
				lastSeen: now,
			});
		}

		return { success: true, updated: true };
	},
});

// ===== CLEANUP FUNCTIONS (Internal - called by cron jobs) =====

// Clean up old presence data (called every 30 minutes)
export const cleanupOldPresenceData = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Remove channel presence entries older than 1 hour
		const oneHourAgo = Date.now() - 60 * 60 * 1000;

		const oldChannelPresences = await ctx.db
			.query('history')
			.filter((q) =>
				q.and(
					q.neq(q.field('channelId'), undefined), // Only channel-specific entries
					q.lt(q.field('lastSeen'), oneHourAgo)
				)
			)
			.collect();

		// Delete old channel presence entries
		for (const presence of oldChannelPresences) {
			await ctx.db.delete(presence._id);
		}

		console.log(
			`Cleaned up ${oldChannelPresences.length} old channel presence entries`
		);
		return { cleaned: oldChannelPresences.length };
	},
});

// Clean up inactive status entries (called every hour)
export const cleanupInactiveStatus = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Mark users as offline/inactive if they haven't been seen in 10 minutes
		const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

		const inactiveStatuses = await ctx.db
			.query('history')
			.filter((q) =>
				q.and(
					q.or(
						q.eq(q.field('status'), 'online'),
						q.eq(q.field('status'), 'active')
					),
					q.lt(q.field('lastSeen'), tenMinutesAgo)
				)
			)
			.collect();

		// Update inactive users to offline/inactive
		for (const status of inactiveStatuses) {
			const newStatus = status.channelId ? 'inactive' : 'offline';
			await ctx.db.patch(status._id, {
				status: newStatus,
			});
		}

		console.log(
			`Marked ${inactiveStatuses.length} inactive users as offline/inactive`
		);
		return { updated: inactiveStatuses.length };
	},
});

// Clean up very old status entries (called daily)
export const cleanupOldStatusEntries = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Remove status entries older than 30 days
		const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

		const oldStatuses = await ctx.db
			.query('history')
			.filter((q) => q.lt(q.field('lastSeen'), thirtyDaysAgo))
			.collect();

		// Delete old status entries
		for (const status of oldStatuses) {
			await ctx.db.delete(status._id);
		}

		console.log(`Cleaned up ${oldStatuses.length} old status entries`);
		return { cleaned: oldStatuses.length };
	},
});
