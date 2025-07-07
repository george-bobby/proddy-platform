// Legacy status file - kept for backward compatibility
// New presence functionality is in presence.ts using @convex-dev/presence

import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import {
	type QueryCtx,
	mutation,
	query,
	internalMutation,
} from './_generated/server';

// Legacy status update - now returns success without doing anything
// Use presence.ts for new presence functionality
export const update = mutation({
	args: {
		status: v.string(),
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')),
	},
	handler: async (ctx, args) => {
		// Legacy function - no longer updates status
		// Use presence.workspaceHeartbeat instead
		return {
			success: true,
			updated: false,
			reason: 'Legacy function - use presence system instead',
		};
	},
});

// Legacy function - returns empty array
export const getForWorkspace = query({
	args: { workspaceId: v.id('workspaces') },
	handler: async (ctx, args) => {
		// Legacy function - returns empty array
		// Use presence.listWorkspacePresence instead
		return [];
	},
});

// Legacy function - returns offline status
export const getUserStatus = query({
	args: {
		workspaceId: v.id('workspaces'),
		userId: v.optional(v.id('users')),
	},
	handler: async (ctx, args) => {
		// Legacy function - returns offline status
		// Use presence.listUserPresence instead
		return { status: 'offline', lastSeen: 0 };
	},
});

// Legacy function - returns empty array
export const getChannelPresence = query({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
	},
	handler: async (ctx, args) => {
		// Legacy function - returns empty array
		// Use presence.list with channel room instead
		return [];
	},
});

// Legacy function - no-op
export const updateChannelPresence = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
		status: v.union(v.literal('active'), v.literal('inactive')),
	},
	handler: async (ctx, args) => {
		// Legacy function - no longer updates status
		// Use presence.heartbeat with channel room instead
		return { success: true, updated: false };
	},
});

// Legacy cleanup functions - no-op
export const cleanupInactiveStatus = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Legacy function - no longer needed
		// Presence component handles cleanup automatically
		return { cleaned: 0 };
	},
});

export const cleanupOldStatusEntries = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Legacy function - no longer needed
		// Presence component handles cleanup automatically
		return { cleaned: 0 };
	},
});

export const cleanupOldPresenceData = internalMutation({
	args: {},
	handler: async (ctx) => {
		// Legacy function - no longer needed
		// Presence component handles cleanup automatically
		return { cleaned: 0 };
	},
});

// Legacy function for marking user offline globally
export const markUserOfflineGlobally = mutation({
	args: {},
	handler: async (ctx) => {
		// Legacy function - no longer needed
		// Presence component handles disconnection automatically
		return { success: true };
	},
});
