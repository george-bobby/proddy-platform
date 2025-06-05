import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// Type definitions for workspace preferences
export type ExpandedSections = Record<string, boolean>;

export type WidgetSize = 'small' | 'large';

export type DashboardWidget = {
	id: string;
	title: string;
	description: string;
	visible: boolean;
	size: WidgetSize;
};

export type WorkspacePreference = {
	sidebarCollapsed?: boolean;
	expandedSections?: ExpandedSections;
	dashboardWidgets?: DashboardWidget[];
};

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
				statusTracking: v.optional(v.boolean()),
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
			// Update existing preferences, merging with existing settings
			await ctx.db.patch(existingPrefs._id, {
				settings: {
					...existingPrefs.settings,
					...args.settings,
				},
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

/**
 * Check if user has status tracking enabled (default: true)
 */
export const isStatusTrackingEnabled = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return false;

		const preferences = await ctx.db
			.query('userPreferences')
			.withIndex('by_user_id', (q) => q.eq('userId', userId))
			.unique();

		// Default to true if no preference is set
		return preferences?.settings?.statusTracking ?? true;
	},
});

/**
 * Get workspace preferences for a specific workspace
 */
export const getWorkspacePreferences = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			return null;
		}

		// Get user preferences
		const userPrefs = await ctx.db
			.query('userPreferences')
			.withIndex('by_user_id', (q) => q.eq('userId', userId))
			.unique();

		if (!userPrefs || !userPrefs.workspacePreferences) {
			return null;
		}

		// Convert workspaceId to string for use as a key in the record
		const workspaceIdStr = args.workspaceId.toString();

		// Return the preferences for this specific workspace
		return userPrefs.workspacePreferences[workspaceIdStr] || null;
	},
});

/**
 * Update workspace preferences for a specific workspace
 */
export const updateWorkspacePreferences = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		preferences: v.object({
			sidebarCollapsed: v.optional(v.boolean()),
			expandedSections: v.optional(v.record(v.string(), v.boolean())),
			dashboardWidgets: v.optional(
				v.array(
					v.object({
						id: v.string(),
						title: v.string(),
						description: v.string(),
						visible: v.boolean(),
						size: v.union(v.literal('small'), v.literal('large')),
					})
				)
			),
		}),
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

		// Convert workspaceId to string for use as a key in the record
		const workspaceIdStr = args.workspaceId.toString();

		if (existingPrefs) {
			// Get current workspace preferences or initialize empty object
			const currentWorkspacePrefs = existingPrefs.workspacePreferences || {};

			// Update the preferences for this specific workspace
			const updatedWorkspacePrefs = {
				...currentWorkspacePrefs,
				[workspaceIdStr]: {
					...currentWorkspacePrefs[workspaceIdStr],
					...args.preferences,
				},
			};

			// Update existing preferences
			await ctx.db.patch(existingPrefs._id, {
				workspacePreferences: updatedWorkspacePrefs,
			});
		} else {
			// Create new preferences with workspace preferences
			await ctx.db.insert('userPreferences', {
				userId,
				workspacePreferences: {
					[workspaceIdStr]: args.preferences,
				},
			});
		}

		return { success: true };
	},
});

/**
 * Update sidebar collapsed state for a specific workspace
 */
export const updateSidebarCollapsed = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		isCollapsed: v.boolean(),
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

		// Convert workspaceId to string for use as a key in the record
		const workspaceIdStr = args.workspaceId.toString();

		if (existingPrefs) {
			// Get current workspace preferences or initialize empty object
			const currentWorkspacePrefs = existingPrefs.workspacePreferences || {};

			// Get current preferences for this workspace or initialize
			const currentPrefs = currentWorkspacePrefs[workspaceIdStr] || {};

			// Update the sidebar collapsed state
			const updatedWorkspacePrefs = {
				...currentWorkspacePrefs,
				[workspaceIdStr]: {
					...currentPrefs,
					sidebarCollapsed: args.isCollapsed,
				},
			};

			// Update existing preferences
			await ctx.db.patch(existingPrefs._id, {
				workspacePreferences: updatedWorkspacePrefs,
			});
		} else {
			// Create new preferences with workspace preferences
			await ctx.db.insert('userPreferences', {
				userId,
				workspacePreferences: {
					[workspaceIdStr]: {
						sidebarCollapsed: args.isCollapsed,
					},
				},
			});
		}

		return { success: true };
	},
});

/**
 * Update dashboard widgets for a specific workspace
 */
export const updateDashboardWidgets = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		dashboardWidgets: v.array(
			v.object({
				id: v.string(),
				title: v.string(),
				description: v.string(),
				visible: v.boolean(),
				size: v.union(v.literal('small'), v.literal('large')),
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

		// Convert workspaceId to string for use as a key in the record
		const workspaceIdStr = args.workspaceId.toString();

		if (existingPrefs) {
			// Get current workspace preferences or initialize empty object
			const currentWorkspacePrefs = existingPrefs.workspacePreferences || {};

			// Get current preferences for this workspace or initialize
			const currentPrefs = currentWorkspacePrefs[workspaceIdStr] || {};

			// Update the dashboard widgets
			const updatedWorkspacePrefs = {
				...currentWorkspacePrefs,
				[workspaceIdStr]: {
					...currentPrefs,
					dashboardWidgets: args.dashboardWidgets,
				},
			};

			// Update existing preferences
			await ctx.db.patch(existingPrefs._id, {
				workspacePreferences: updatedWorkspacePrefs,
			});
		} else {
			// Create new preferences with workspace preferences
			await ctx.db.insert('userPreferences', {
				userId,
				workspacePreferences: {
					[workspaceIdStr]: {
						dashboardWidgets: args.dashboardWidgets,
					},
				},
			});
		}

		return { success: true };
	},
});
