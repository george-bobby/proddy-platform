import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { type QueryCtx, mutation, query } from './_generated/server';

// Update user status (online/offline) with advanced race condition handling
export const update = mutation({
	args: {
		status: v.string(),
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		// Check if the user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) throw new Error('Not a member of this workspace.');

		const timestamp = Date.now();

		// Advanced retry logic with exponential backoff and optimistic locking
		const maxRetries = 5;
		let baseDelay = 50;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				// Check if there's an existing status entry (fresh query each time)
				const existing = await ctx.db
					.query('history')
					.withIndex('by_workspace_id_user_id', (q) =>
						q.eq('workspaceId', args.workspaceId).eq('userId', userId)
					)
					.unique();

				if (existing) {
					// Check if the status actually needs updating (avoid unnecessary writes)
					if (
						existing.status === args.status &&
						timestamp - existing.lastSeen < 10000
					) {
						// Status is the same and was updated less than 10 seconds ago, skip update
						return { success: true, skipped: true };
					}

					// Update existing status with optimistic locking check
					await ctx.db.patch(existing._id, {
						status: args.status,
						lastSeen: timestamp,
					});
				} else {
					// Create new status entry
					await ctx.db.insert('history', {
						userId,
						workspaceId: args.workspaceId,
						status: args.status,
						lastSeen: timestamp,
					});
				}

				return { success: true };
			} catch (error) {
				// Check if this is a race condition error
				const isRaceCondition =
					error instanceof Error &&
					error.message.includes('changed while this mutation was being run');

				if (!isRaceCondition || attempt === maxRetries - 1) {
					console.error(
						`Failed to update status after ${attempt + 1} attempts:`,
						error
					);

					// For non-race condition errors, throw immediately
					if (!isRaceCondition) {
						throw error;
					}

					// For race conditions on final attempt, return graceful failure
					return { success: false, error: 'Race condition after max retries' };
				}

				// Exponential backoff with jitter for race conditions
				const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		return { success: false };
	},
});

// Mark user as offline across all workspaces (called on logout) with retry logic
export const markUserOfflineGlobally = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return { success: false };

		const timestamp = Date.now();
		const maxRetries = 3;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				// Get all status entries for this user across all workspaces
				const userStatuses = await ctx.db
					.query('history')
					.withIndex('by_user_id', (q) => q.eq('userId', userId))
					.collect();

				// Update all entries to offline sequentially to avoid race conditions
				for (const status of userStatuses) {
					try {
						await ctx.db.patch(status._id, {
							status: 'offline',
							lastSeen: timestamp,
						});
					} catch (patchError) {
						// Log individual patch errors but continue with others
						console.warn(`Failed to update status ${status._id}:`, patchError);
					}
				}

				return { success: true };
			} catch (error) {
				// If this is the last attempt, throw the error
				if (attempt === maxRetries - 1) {
					console.error(
						`Failed to mark user offline globally after ${maxRetries} attempts:`,
						error
					);
					return {
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
					};
				}

				// Wait a small random amount before retrying
				await new Promise((resolve) =>
					setTimeout(resolve, Math.random() * 100 + 50)
				);
			}
		}

		return { success: false };
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

		// Apply the same logic as getUserStatus to determine effective status
		const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

		return statusEntries.map((s) => {
			const isRecentlyActive = s.lastSeen > twoMinutesAgo;
			const effectiveStatus =
				s.status === 'online' && !isRecentlyActive ? 'offline' : s.status;

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

		// Get status for the specified user
		// We can safely use args.userId here because we've already checked that it exists
		const userId = args.userId; // This helps TypeScript understand that userId is defined
		const status = await ctx.db
			.query('history')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!status) return { status: 'offline', lastSeen: 0 };

		// Check if the user is still authenticated by looking for recent activity
		// If the last seen time is more than 2 minutes ago, consider them potentially logged out
		const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
		const isRecentlyActive = status.lastSeen > twoMinutesAgo;

		// If status is online but user hasn't been active recently, mark as offline
		const effectiveStatus =
			status.status === 'online' && !isRecentlyActive
				? 'offline'
				: status.status;

		return {
			status: effectiveStatus,
			lastSeen: status.lastSeen,
		};
	},
});
