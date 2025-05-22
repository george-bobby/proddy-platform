import { action, query } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';

// Define result types
type SearchResult = {
	_id: Id<any>;
	_creationTime: number;
	type: string;
	text: string;
	workspaceId: Id<'workspaces'>;
	[key: string]: any;
};

type MessageResult = SearchResult & {
	type: 'message';
	channelId?: Id<'channels'>;
	memberId: Id<'members'>;
};

type TaskResult = SearchResult & {
	type: 'task';
	status: string;
	completed: boolean;
	userId: Id<'users'>;
};

type NoteResult = SearchResult & {
	type: 'note';
	channelId: Id<'channels'>;
	memberId: Id<'members'>;
};

type CardResult = SearchResult & {
	type: 'card';
	listId: Id<'lists'>;
	listName: string;
	channelId?: Id<'channels'>;
	channelName?: string;
};

// Helper function to extract plain text from message body
function extractTextFromRichText(body: string): string {
	if (typeof body !== 'string') {
		return String(body);
	}

	try {
		// Try to parse as JSON (Quill Delta format)
		const parsedBody = JSON.parse(body);
		if (parsedBody.ops) {
			return parsedBody.ops
				.map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
				.join('')
				.trim();
		}
	} catch (e) {
		// Not JSON, use as is (might contain HTML)
		return body
			.replace(/<[^>]*>/g, '') // Remove HTML tags
			.trim();
	}

	return body.trim();
}

// Search messages in a workspace
export const searchMessages = query({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')),
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args): Promise<MessageResult[]> => {
		const limit = args.limit || 5;

		let messagesQuery = ctx.db
			.query('messages')
			.withSearchIndex('search_body', (q) => {
				let query = q
					.search('body', args.query)
					.eq('workspaceId', args.workspaceId);
				if (args.channelId) {
					query = query.eq('channelId', args.channelId);
				}
				return query;
			});

		const messages = await messagesQuery.take(limit);

		// Process messages to extract plain text and add metadata
		return messages.map((message) => {
			return {
				_id: message._id,
				_creationTime: message._creationTime,
				type: 'message',
				text: extractTextFromRichText(message.body),
				channelId: message.channelId,
				memberId: message.memberId,
				workspaceId: message.workspaceId,
			};
		});
	},
});

// Search tasks in a workspace
export const searchTasks = query({
	args: {
		workspaceId: v.id('workspaces'),
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args): Promise<TaskResult[]> => {
		const limit = args.limit || 5;

		let tasksQuery = ctx.db
			.query('tasks')
			.withSearchIndex('search_title_description', (q) => {
				return q
					.search('title', args.query)
					.eq('workspaceId', args.workspaceId);
			});

		const tasks = await tasksQuery.take(limit);

		// Process tasks to add metadata
		return tasks.map((task) => {
			return {
				_id: task._id,
				_creationTime: task._creationTime,
				type: 'task',
				text: task.title + (task.description ? `: ${task.description}` : ''),
				status: task.status || 'not_started',
				completed: task.completed,
				workspaceId: task.workspaceId,
				userId: task.userId,
			};
		});
	},
});

// Search notes in a workspace
export const searchNotes = query({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')),
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args): Promise<NoteResult[]> => {
		const limit = args.limit || 5;

		let notesQuery = ctx.db
			.query('notes')
			.withSearchIndex('search_title_content', (q) => {
				let query = q
					.search('title', args.query)
					.eq('workspaceId', args.workspaceId);
				if (args.channelId) {
					query = query.eq('channelId', args.channelId);
				}
				return query;
			});

		const notes = await notesQuery.take(limit);

		// Process notes to extract plain text and add metadata
		return notes.map((note) => {
			return {
				_id: note._id,
				_creationTime: note._creationTime,
				type: 'note',
				text: note.title + ': ' + extractTextFromRichText(note.content),
				channelId: note.channelId,
				memberId: note.memberId,
				workspaceId: note.workspaceId,
			};
		});
	},
});

// Search cards in a workspace
export const searchCards = query({
	args: {
		workspaceId: v.id('workspaces'),
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args): Promise<CardResult[]> => {
		const limit = args.limit || 5;

		// First, get all lists in the workspace
		const channels = await ctx.db
			.query('channels')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		const channelIds = channels.map((channel) => channel._id);

		// Get all lists in these channels
		const lists = await Promise.all(
			channelIds.map((channelId) =>
				ctx.db
					.query('lists')
					.withIndex('by_channel_id', (q) => q.eq('channelId', channelId))
					.collect()
			)
		).then((results) => results.flat());

		const listIds = lists.map((list) => list._id);

		// Now search cards in these lists
		// Use search index for each list
		const cards = await Promise.all(
			listIds.map((listId) =>
				ctx.db
					.query('cards')
					.withSearchIndex('search_title_description', (q) =>
						q.search('title', args.query).eq('listId', listId)
					)
					.take(Math.ceil(limit / listIds.length))
			)
		).then((results) => results.flat().slice(0, limit));

		// Process cards to add metadata
		return await Promise.all(
			cards.map(async (card) => {
				const list = lists.find((l) => l._id === card.listId);
				const channel = list
					? channels.find((c) => c._id === list.channelId)
					: null;

				return {
					_id: card._id,
					_creationTime: card._creationTime,
					type: 'card',
					text: card.title + (card.description ? `: ${card.description}` : ''),
					listId: card.listId,
					listName: list?.title || 'Unknown List',
					channelId: channel?._id,
					channelName: channel?.name || 'Unknown Channel',
					workspaceId: args.workspaceId,
				};
			})
		);
	},
});

// Comprehensive search across all content types
export const searchAll = query({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')),
		query: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args): Promise<SearchResult[]> => {
		const totalLimit = args.limit || 10;
		const perTypeLimit = Math.ceil(totalLimit / 4); // Divide limit among 4 types

		// Run all searches in parallel
		const [messages, tasks, notes, cards] = await Promise.all([
			ctx.runQuery(api.search.searchMessages, {
				workspaceId: args.workspaceId,
				channelId: args.channelId,
				query: args.query,
				limit: perTypeLimit,
			}),
			ctx.runQuery(api.search.searchTasks, {
				workspaceId: args.workspaceId,
				query: args.query,
				limit: perTypeLimit,
			}),
			ctx.runQuery(api.search.searchNotes, {
				workspaceId: args.workspaceId,
				channelId: args.channelId,
				query: args.query,
				limit: perTypeLimit,
			}),
			ctx.runQuery(api.search.searchCards, {
				workspaceId: args.workspaceId,
				query: args.query,
				limit: perTypeLimit,
			}),
		]);

		// Combine and sort by creation time (newest first)
		const allResults = [...messages, ...tasks, ...notes, ...cards]
			.sort((a, b) => b._creationTime - a._creationTime)
			.slice(0, totalLimit);

		return allResults;
	},
});
