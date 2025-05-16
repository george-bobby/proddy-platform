import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

// Create a new folder
export const create = mutation({
	args: {
		name: v.string(),
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
		parentFolderId: v.optional(v.id('noteFolders')),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		// If parentFolderId is provided, verify it exists and belongs to the same channel
		if (args.parentFolderId) {
			const parentFolder = await ctx.db.get(args.parentFolderId);

			if (!parentFolder || parentFolder.channelId !== args.channelId) {
				throw new Error('Invalid parent folder');
			}
		}

		const now = Date.now();

		const folderId = await ctx.db.insert('noteFolders', {
			name: args.name,
			workspaceId: args.workspaceId,
			channelId: args.channelId,
			memberId: member._id,
			parentFolderId: args.parentFolderId,
			icon: args.icon,
			createdAt: now,
			updatedAt: now,
		});

		return folderId;
	},
});

// Get all folders for a channel
export const list = query({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		const folders = await ctx.db
			.query('noteFolders')
			.withIndex('by_workspace_id_channel_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('channelId', args.channelId)
			)
			.collect();

		return folders;
	},
});

// Update a folder
export const update = mutation({
	args: {
		id: v.id('noteFolders'),
		name: v.optional(v.string()),
		parentFolderId: v.optional(v.id('noteFolders')),
		icon: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const folder = await ctx.db.get(args.id);

		if (!folder) {
			throw new Error('Folder not found');
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', folder.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		// If parentFolderId is provided, verify it exists and belongs to the same channel
		if (args.parentFolderId) {
			const parentFolder = await ctx.db.get(args.parentFolderId);

			if (!parentFolder || parentFolder.channelId !== folder.channelId) {
				throw new Error('Invalid parent folder');
			}

			// Prevent circular references
			if (args.parentFolderId === args.id) {
				throw new Error('A folder cannot be its own parent');
			}
		}

		const updates: any = {
			updatedAt: Date.now(),
		};

		if (args.name !== undefined) {
			updates.name = args.name;
		}

		if (args.parentFolderId !== undefined) {
			updates.parentFolderId = args.parentFolderId;
		}

		if (args.icon !== undefined) {
			updates.icon = args.icon;
		}

		await ctx.db.patch(args.id, updates);

		return args.id;
	},
});

// Delete a folder
export const remove = mutation({
	args: {
		id: v.id('noteFolders'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const folder = await ctx.db.get(args.id);

		if (!folder) {
			throw new Error('Folder not found');
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', folder.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		try {
			// First, delete all notes in this folder
			const notes = await ctx.db
				.query('notes')
				.withIndex('by_folder_id', (q) => q.eq('folderId', args.id))
				.collect();

			console.log(`Deleting ${notes.length} notes in folder ${args.id}`);

			for (const note of notes) {
				await ctx.db.delete(note._id);
			}

			// Then, find all subfolders
			const subfolders = await ctx.db
				.query('noteFolders')
				.withIndex('by_parent_folder_id', (q) =>
					q.eq('parentFolderId', args.id)
				)
				.collect();

			console.log(`Found ${subfolders.length} subfolders in folder ${args.id}`);

			// Delete each subfolder (this will trigger cascading deletion for each)
			for (const subfolder of subfolders) {
				console.log(`Deleting subfolder ${subfolder._id}`);
				// Call this same mutation recursively for each subfolder
				await ctx.db.delete(subfolder._id);
			}

			// Finally delete the folder itself
			console.log(`Deleting the main folder ${args.id}`);
			await ctx.db.delete(args.id);

			return args.id;
		} catch (error) {
			console.error('Error during folder deletion:', error);
			throw new Error(
				'Failed to delete folder: ' +
					(error instanceof Error ? error.message : String(error))
			);
		}
	},
});
