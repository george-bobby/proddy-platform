import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from '../_generated/dataModel';
import { mutation } from '../_generated/server';
// import { api } from '../_generated/api'; // Commented out to avoid TypeScript circular dependency issues
import { getMember } from './message_queries';

// Create a new message
export const create = mutation({
	args: {
		body: v.string(),
		image: v.optional(v.id('_storage')),
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')),
		conversationId: v.optional(v.id('conversations')),
		parentMessageId: v.optional(v.id('messages')),
		calendarEvent: v.optional(
			v.object({
				date: v.number(),
				time: v.optional(v.string()),
			})
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		const member = await getMember(
			ctx,
			args.workspaceId,
			userId as Id<'users'>
		);

		if (!member) throw new Error('Unauthorized.');

		let _conversationId = args.conversationId;

		// replying in a thread in 1-1 conversation
		if (!args.conversationId && !args.channelId && args.parentMessageId) {
			const parentMessage = await ctx.db.get(args.parentMessageId);

			if (!parentMessage) throw new Error('Parent message not found.');

			_conversationId = parentMessage.conversationId;
		}

		// Verify channel exists if channelId is provided
		if (args.channelId) {
			const channel = await ctx.db.get(args.channelId);
			if (!channel) {
				throw new Error('Channel not found.');
			}
		}

		const messageId = await ctx.db.insert('messages', {
			memberId: member._id,
			body: args.body,
			image: args.image,
			channelId: args.channelId,
			workspaceId: args.workspaceId,
			conversationId: _conversationId,
			parentMessageId: args.parentMessageId,
			calendarEvent: args.calendarEvent,
		});

		// If this is a reply to a thread, send an email notification
		if (args.parentMessageId) {
			await (ctx.scheduler.runAfter as any)(
				0,
				'threadReplies:sendThreadReplyEmail' as any,
				{
					messageId,
					parentMessageId: args.parentMessageId,
				}
			);
		}

		// If this is a direct message, send an email notification
		if (args.conversationId) {
			await (ctx.scheduler.runAfter as any)(
				0,
				'directMessageEmails:sendDirectMessageEmail' as any,
				{
					messageId,
				}
			);
		}

		// Process mentions in the message (skip for direct messages)
		// If this is a direct message (has conversationId), skip mention processing
		if (args.conversationId) {
			return messageId;
		}

		try {
			// Get all members in the workspace to check for mentions
			const workspaceMembers = await ctx.db
				.query('members')
				.withIndex('by_workspace_id', (q) =>
					q.eq('workspaceId', args.workspaceId)
				)
				.collect();

			// Create a map of member ID to member for quick lookup
			const memberMap = new Map(workspaceMembers.map((m) => [m._id, m]));

			// Get all users associated with these members
			const userIds = workspaceMembers.map((m) => m.userId);
			const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

			// Create a map of user ID to user for quick lookup
			const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u]));

			// Create a map of member ID to user name for mention detection
			const memberIdToName = new Map();
			workspaceMembers.forEach((m) => {
				const user = userMap.get(m.userId);
				if (user && user.name) {
					memberIdToName.set(m._id, user.name);
				}
			});

			// Check for mentions in the message body
			const mentionedMemberIds = new Set<Id<'members'>>();

			// Check for data-member-id attributes in HTML
			const memberIdRegex = /data-member-id="([^"]+)"/g;
			let match;
			while ((match = memberIdRegex.exec(args.body)) !== null) {
				const memberId = match[1] as Id<'members'>;
				if (memberMap.has(memberId)) {
					mentionedMemberIds.add(memberId);
				}
			}

			// Check for @username mentions in text or Quill Delta format
			try {
				// Try to parse as JSON (Quill Delta format)
				const parsedBody = JSON.parse(args.body);
				if (parsedBody.ops) {
					for (const op of parsedBody.ops) {
						if (op.insert && typeof op.insert === 'string') {
							// Check for data-member-id in HTML
							const memberIdRegex = /data-member-id="([^"]+)"/g;
							let match;
							while ((match = memberIdRegex.exec(op.insert)) !== null) {
								const memberId = match[1] as Id<'members'>;
								if (memberMap.has(memberId)) {
									mentionedMemberIds.add(memberId);
								}
							}

							// Check for @username mentions
							// Use Array.from to convert Map entries to an array for compatibility
							Array.from(memberIdToName.entries()).forEach(
								([memberId, name]) => {
									if (op.insert.includes(`@${name}`)) {
										mentionedMemberIds.add(memberId);
									}
								}
							);
						}
					}
				}
			} catch (e) {
				// Not JSON, check for @username mentions in plain text
				// Use Array.from to convert Map entries to an array for compatibility
				Array.from(memberIdToName.entries()).forEach(([memberId, name]) => {
					if (args.body.includes(`@${name}`)) {
						mentionedMemberIds.add(memberId);
					}
				});
			}

			// Create mention records for each mentioned member
			for (const mentionedMemberId of Array.from(mentionedMemberIds)) {
				// Create the mention record
				const mentionId = await ctx.db.insert('mentions', {
					messageId,
					mentionedMemberId,
					mentionerMemberId: member._id,
					workspaceId: args.workspaceId,
					channelId: args.channelId,
					conversationId: _conversationId,
					parentMessageId: args.parentMessageId,
					read: false,
					createdAt: Date.now(),
				});

				// Schedule an email notification for the mention
				await (ctx.scheduler.runAfter as any)(
					0,
					'mentions:sendMentionEmail' as any,
					{
						mentionId,
					}
				);
			}
		} catch (error) {
			// Don't throw the error, as we still want to return the message ID
			// even if mention processing fails
		}

		return messageId;
	},
});

// Update a message
export const update = mutation({
	args: {
		id: v.id('messages'),
		body: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		const message = await ctx.db.get(args.id);

		if (!message) throw new Error('Message not found.');

		const member = await getMember(
			ctx,
			message.workspaceId,
			userId as Id<'users'>
		);

		if (!member || member._id !== message.memberId)
			throw new Error('Unauthorized.');

		await ctx.db.patch(args.id, {
			body: args.body,
			updatedAt: Date.now(),
		});

		return args.id;
	},
});

// Remove a message
export const remove = mutation({
	args: {
		id: v.id('messages'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) throw new Error('Unauthorized.');

		const message = await ctx.db.get(args.id);

		if (!message) throw new Error('Message not found.');

		const member = await getMember(
			ctx,
			message.workspaceId,
			userId as Id<'users'>
		);

		if (!member || member._id !== message.memberId)
			throw new Error('Unauthorized.');

		await ctx.db.delete(args.id);

		return args.id;
	},
});
