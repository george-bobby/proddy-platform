import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// Helper query to get a channel by ID (for internal use)
export const _getChannelById = query({
	args: {
		channelId: v.id('channels'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.channelId);
	},
});

export const remove = mutation({
	args: {
		id: v.id('channels'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		const channel = await ctx.db.get(args.id);

		if (!channel) throw new Error('Channel not found.');

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', channel.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member || (member.role !== 'admin' && member.role !== 'owner'))
			throw new Error('Unauthorized.');

		const [messages] = await Promise.all([
			ctx.db
				.query('messages')
				.withIndex('by_channel_id', (q) => q.eq('channelId', args.id))
				.collect(),
		]);

		for (const message of messages) await ctx.db.delete(message._id);

		await ctx.db.delete(args.id);

		return args.id;
	},
});

export const update = mutation({
	args: {
		id: v.id('channels'),
		name: v.string(),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		const channel = await ctx.db.get(args.id);

		if (!channel) throw new Error('Channel not found.');

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', channel.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) throw new Error('Unauthorized.');

		// Check if we're changing the name (requires admin/owner)
		if (channel.name !== args.name) {
			// Only admins and owners can change the channel name
			if (member.role !== 'admin' && member.role !== 'owner') {
				throw new Error('Only admins and owners can change the channel name.');
			}

			if (args.name.length < 3 || args.name.length > 20)
				throw new Error('Invalid channel name.');
		}

		const parsedName = args.name.replace(/\s+/g, '-').toLowerCase();

		const updateData: { name: string; icon?: string } = {
			name: parsedName,
		};

		if (args.icon !== undefined) {
			updateData.icon = args.icon;
		}

		await ctx.db.patch(args.id, updateData);

		return args.id;
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		workspaceId: v.id('workspaces'),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member || (member.role !== 'admin' && member.role !== 'owner'))
			throw new Error('Unauthorized.');

		if (args.name.length < 3 || args.name.length > 20)
			throw new Error('Invalid channel name.');

		const parsedName = args.name.replace(/\s+/g, '-').toLowerCase();

		const channelId = await ctx.db.insert('channels', {
			name: parsedName,
			workspaceId: args.workspaceId,
			icon: args.icon,
		});

		return channelId;
	},
});

export const getById = query({
	args: {
		id: v.id('channels'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return null;

		const channel = await ctx.db.get(args.id);

		if (!channel) return null;

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', channel.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) return null;

		return channel;
	},
});

export const get = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return [];

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.unique();

		if (!member) return [];

		const channels = await ctx.db
			.query('channels')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		return channels;
	},
});
