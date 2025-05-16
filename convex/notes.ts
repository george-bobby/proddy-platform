import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

// Create a new note
export const create = mutation({
	args: {
		title: v.string(),
		content: v.string(),
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
		folderId: v.optional(v.id('noteFolders')),
		icon: v.optional(v.string()),
		coverImage: v.optional(v.id('_storage')),
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

		// If folderId is provided, verify it exists and belongs to the same channel
		if (args.folderId) {
			const folder = await ctx.db.get(args.folderId);

			if (!folder || folder.channelId !== args.channelId) {
				throw new Error('Invalid folder');
			}
		}

		const now = Date.now();

		const noteId = await ctx.db.insert('notes', {
			title: args.title,
			content: args.content,
			workspaceId: args.workspaceId,
			channelId: args.channelId,
			memberId: member._id,
			folderId: args.folderId,
			icon: args.icon,
			coverImage: args.coverImage,
			createdAt: now,
			updatedAt: now,
		});

		return noteId;
	},
});

// Get all notes for a channel
export const getByChannel = query({
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

		const notes = await ctx.db
			.query('notes')
			.withIndex('by_workspace_id_channel_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('channelId', args.channelId)
			)
			.collect();

		return notes;
	},
});

// Alias for getByChannel to match component expectations
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

		const notes = await ctx.db
			.query('notes')
			.withIndex('by_workspace_id_channel_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('channelId', args.channelId)
			)
			.collect();

		return notes;
	},
});

// Get a single note by ID
export const get = query({
	args: {
		id: v.id('notes'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const note = await ctx.db.get(args.id);

		if (!note) {
			throw new Error('Note not found');
		}

		// Verify the user has access to this note's workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', note.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		return note;
	},
});

// Get notes by folder
export const getByFolder = query({
	args: {
		folderId: v.id('noteFolders'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const folder = await ctx.db.get(args.folderId);

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

		const notes = await ctx.db
			.query('notes')
			.withIndex('by_folder_id', (q) => q.eq('folderId', args.folderId))
			.collect();

		return notes;
	},
});

// Get a single note by ID with noteId parameter
export const getById = query({
	args: {
		noteId: v.id('notes'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const note = await ctx.db.get(args.noteId);

		if (!note) {
			throw new Error('Note not found');
		}

		// Verify the user has access to this note's workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', note.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		return note;
	},
});
// Update a note
export const update = mutation({
	args: {
		id: v.id('notes'),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		folderId: v.optional(v.union(v.id('noteFolders'), v.null())),
		icon: v.optional(v.union(v.string(), v.null())),
		coverImage: v.optional(v.union(v.id('_storage'), v.null())),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const existingNote = await ctx.db.get(args.id);

		if (!existingNote) {
			throw new Error('Note not found');
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', existingNote.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		// If folderId is provided and not null, verify it exists and belongs to the same channel
		if (args.folderId && args.folderId !== null) {
			const folder = await ctx.db.get(args.folderId);

			if (!folder || folder.channelId !== existingNote.channelId) {
				throw new Error('Invalid folder');
			}
		}

		const now = Date.now();

		// Prepare update object
		const updateObj: any = { updatedAt: now };

		// Handle each field, properly dealing with null values
		if (args.title !== undefined) {
			updateObj.title = args.title;
		}

		if (args.content !== undefined) {
			updateObj.content = args.content;
		}

		if (args.folderId !== undefined) {
			// If null, set to undefined to remove the field
			updateObj.folderId = args.folderId === null ? undefined : args.folderId;
		}

		if (args.icon !== undefined) {
			// If null, set to undefined to remove the field
			updateObj.icon = args.icon === null ? undefined : args.icon;
		}

		if (args.coverImage !== undefined) {
			// If null, set to undefined to remove the field
			updateObj.coverImage =
				args.coverImage === null ? undefined : args.coverImage;
		}

		const updatedNote = await ctx.db.patch(args.id, updateObj);

		return updatedNote;
	},
});

// Delete a note
export const remove = mutation({
	args: {
		id: v.id('notes'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) {
			throw new Error('Unauthorized');
		}

		const existingNote = await ctx.db.get(args.id);

		if (!existingNote) {
			console.log(`Note not found: ${args.id}`);
			// Return success even if note doesn't exist to avoid errors
			return args.id;
		}

		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', existingNote.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) {
			throw new Error('Unauthorized');
		}

		try {
			console.log(`Deleting note: ${args.id}`);
			await ctx.db.delete(args.id);
			console.log(`Successfully deleted note: ${args.id}`);
			return args.id;
		} catch (error) {
			console.error(`Error deleting note ${args.id}:`, error);
			throw new Error(
				'Failed to delete note: ' +
					(error instanceof Error ? error.message : String(error))
			);
		}
	},
});
