import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import {
	format,
	startOfDay,
	endOfDay,
	subDays,
	eachDayOfInterval,
} from 'date-fns';

import type { Id } from './_generated/dataModel';
import {
	type QueryCtx,
	type MutationCtx,
	mutation,
	query,
} from './_generated/server';

// Helper function to get the current member
const getMember = async (
	ctx: QueryCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
) => {
	return await ctx.db
		.query('members')
		.withIndex('by_workspace_id_user_id', (q) =>
			q.eq('workspaceId', workspaceId).eq('userId', userId)
		)
		.unique();
};

// Record user activity (page views, time spent)
export const recordUserActivity = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.optional(v.id('channels')),
		activityType: v.string(), // 'page_view', 'message_sent', 'reaction_added', etc.
		duration: v.optional(v.number()), // time spent in milliseconds
		metadata: v.optional(
			v.object({
				path: v.optional(v.string()),
				referrer: v.optional(v.string()),
				details: v.optional(v.string()),
			})
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		const member = await getMember(ctx, args.workspaceId, userId);
		if (!member) throw new Error('Member not found');

		// Record the activity
		const activityId = await ctx.db.insert('userActivities', {
			memberId: member._id,
			workspaceId: args.workspaceId,
			channelId: args.channelId,
			activityType: args.activityType,
			duration: args.duration || 0,
			metadata: args.metadata || {},
			timestamp: Date.now(),
		});

		return activityId;
	},
});

// Record channel session (when user enters/exits a channel)
export const recordChannelSession = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		channelId: v.id('channels'),
		action: v.union(v.literal('enter'), v.literal('exit')),
		sessionId: v.optional(v.id('channelSessions')),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		const member = await getMember(ctx, args.workspaceId, userId);
		if (!member) throw new Error('Member not found');

		const timestamp = Date.now();

		if (args.action === 'enter') {
			// Start a new session
			return await ctx.db.insert('channelSessions', {
				memberId: member._id,
				workspaceId: args.workspaceId,
				channelId: args.channelId,
				startTime: timestamp,
				endTime: undefined, // Will be updated on exit
				duration: 0, // Will be calculated on exit
			});
		} else if (args.action === 'exit' && args.sessionId) {
			// End the session and calculate duration
			const session = await ctx.db.get(args.sessionId);
			if (!session) throw new Error('Session not found');

			const duration = timestamp - session.startTime;

			await ctx.db.patch(args.sessionId, {
				endTime: timestamp,
				duration: duration,
			});

			return args.sessionId;
		}

		throw new Error('Invalid action or missing sessionId');
	},
});

// Get user activity summary for a workspace
export const getUserActivitySummary = query({
	args: {
		workspaceId: v.id('workspaces'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Default to last 30 days if dates not provided
		const endDate = args.endDate || Date.now();
		const startDate = args.startDate || endDate - 30 * 24 * 60 * 60 * 1000;

		// Get all members in the workspace
		const members = await ctx.db
			.query('members')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Get user details for each member
		const memberDetails = await Promise.all(
			members.map(async (member) => {
				const user = await ctx.db.get(member.userId);
				return { ...member, user };
			})
		);

		// Get activity counts for each member
		const memberActivityPromises = members.map(async (member) => {
			// Count messages
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_member_id', (q) => q.eq('memberId', member._id))
				.filter((q) =>
					q.and(
						q.gte(q.field('_creationTime'), startDate),
						q.lte(q.field('_creationTime'), endDate)
					)
				)
				.collect();
			const messageCount = messages.length;

			// Count reactions
			const reactions = await ctx.db
				.query('reactions')
				.withIndex('by_member_id', (q) => q.eq('memberId', member._id))
				.filter((q) =>
					q.and(
						q.gte(q.field('_creationTime'), startDate),
						q.lte(q.field('_creationTime'), endDate)
					)
				)
				.collect();
			const reactionCount = reactions.length;

			// Get total time spent in channels
			const channelSessions = await ctx.db
				.query('channelSessions')
				.withIndex('by_member_id', (q) => q.eq('memberId', member._id))
				.filter((q) =>
					q.and(
						q.gte(q.field('startTime'), startDate),
						q.lte(q.field('startTime'), endDate)
					)
				)
				.collect();

			const totalTimeSpent = channelSessions.reduce((total, session) => {
				return total + (session.duration || 0);
			}, 0);

			// Get activity by type
			const activities = await ctx.db
				.query('userActivities')
				.withIndex('by_member_id', (q) => q.eq('memberId', member._id))
				.filter((q) =>
					q.and(
						q.gte(q.field('timestamp'), startDate),
						q.lte(q.field('timestamp'), endDate)
					)
				)
				.collect();

			// Group activities by type
			const activityByType = activities.reduce(
				(acc, activity) => {
					const type = activity.activityType;
					if (!acc[type]) acc[type] = 0;
					acc[type]++;
					return acc;
				},
				{} as Record<string, number>
			);

			return {
				member: memberDetails.find((m) => m._id === member._id),
				messageCount,
				reactionCount,
				totalTimeSpent,
				activityByType,
			};
		});

		const memberActivity = await Promise.all(memberActivityPromises);

		return memberActivity;
	},
});

// Get active users count for a workspace within a time period
export const getActiveUsersCount = query({
	args: {
		workspaceId: v.id('workspaces'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Default to last 7 days if dates not provided
		const endDate = args.endDate || Date.now();
		const startDate = args.startDate || endDate - 7 * 24 * 60 * 60 * 1000;

		// Get all members in the workspace
		const members = await ctx.db
			.query('members')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Count active users based on activity within the selected time period AND currently logged-in users
		const activeUserIds = new Set<Id<'members'>>();

		// Add users who sent messages in the time period
		const messages = await ctx.db
			.query('messages')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('_creationTime'), startDate),
					q.lte(q.field('_creationTime'), endDate)
				)
			)
			.collect();
		messages.forEach((message) => activeUserIds.add(message.memberId));

		// Add users who added reactions in the time period
		const reactions = await ctx.db
			.query('reactions')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('_creationTime'), startDate),
					q.lte(q.field('_creationTime'), endDate)
				)
			)
			.collect();
		reactions.forEach((reaction) => activeUserIds.add(reaction.memberId));

		// Add users who had channel sessions in the time period
		const channelSessions = await ctx.db
			.query('channelSessions')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('startTime'), startDate),
					q.lte(q.field('startTime'), endDate)
				)
			)
			.collect();
		channelSessions.forEach((session) => activeUserIds.add(session.memberId));

		// Add users who had any user activities in the time period
		const userActivities = await ctx.db
			.query('userActivities')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('timestamp'), startDate),
					q.lte(q.field('timestamp'), endDate)
				)
			)
			.collect();
		userActivities.forEach((activity) => activeUserIds.add(activity.memberId));

		// ALSO add currently logged-in users (users who are online right now)
		// Get all user IDs from workspace members
		const memberUserIds = members.map(member => member.userId);

		// Get current login status for all workspace members
		const userStatuses = await ctx.db
			.query('history')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Add currently online users to active users
		const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
		userStatuses.forEach((status) => {
			// Check if this user is a member of the workspace
			if (memberUserIds.includes(status.userId)) {
				const isRecentlyActive = status.lastSeen > twoMinutesAgo;
				const effectiveStatus = status.status === 'online' && isRecentlyActive ? 'online' : 'offline';

				if (effectiveStatus === 'online') {
					// Find the member ID for this user
					const member = members.find(m => m.userId === status.userId);
					if (member) {
						activeUserIds.add(member._id);
					}
				}
			}
		});

		const activeUserCount = activeUserIds.size;
		const activeUserPercentage = members.length > 0 ? Math.round((activeUserCount / members.length) * 100) : 0;

		// Get active user details for tooltip
		const activeUserDetails = await Promise.all(
			Array.from(activeUserIds).map(async (memberId) => {
				const member = await ctx.db.get(memberId);
				if (!member) return null;

				const user = await ctx.db.get(member.userId);
				return {
					memberId,
					userId: member.userId,
					name: user?.name || 'Unknown User',
					email: user?.email || '',
				};
			})
		);

		// Filter out null values
		const validActiveUsers = activeUserDetails.filter(user => user !== null);

		return {
			totalMembers: members.length,
			activeUserCount,
			activeUserPercentage,
			activeUsers: validActiveUsers,
		};
	},
});

// Get workspace overview stats
export const getWorkspaceOverview = query({
	args: {
		workspaceId: v.id('workspaces'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Default to last 30 days if dates not provided
		const endDate = args.endDate || Date.now();
		const startDate = args.startDate || endDate - 30 * 24 * 60 * 60 * 1000;

		// Get all members in the workspace
		const members = await ctx.db
			.query('members')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Get all channels in the workspace
		const channels = await ctx.db
			.query('channels')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Count messages in the workspace
		const messages = await ctx.db
			.query('messages')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('_creationTime'), startDate),
					q.lte(q.field('_creationTime'), endDate)
				)
			)
			.collect();

		// Count tasks in the workspace
		const tasks = await ctx.db
			.query('tasks')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('createdAt'), startDate),
					q.lte(q.field('createdAt'), endDate)
				)
			)
			.collect();

		// Count completed tasks
		const completedTasks = tasks.filter((task) => task.completed).length;

		// Count active users based on activity within the selected time period AND currently logged-in users
		const activeUserIds = new Set<Id<'members'>>();

		// Add users who sent messages in the time period
		messages.forEach((message) => activeUserIds.add(message.memberId));

		// Add users who added reactions in the time period
		const reactions = await ctx.db
			.query('reactions')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('_creationTime'), startDate),
					q.lte(q.field('_creationTime'), endDate)
				)
			)
			.collect();
		reactions.forEach((reaction) => activeUserIds.add(reaction.memberId));

		// Add users who had channel sessions in the time period
		const channelSessions = await ctx.db
			.query('channelSessions')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('startTime'), startDate),
					q.lte(q.field('startTime'), endDate)
				)
			)
			.collect();
		channelSessions.forEach((session) => activeUserIds.add(session.memberId));

		// Add users who had any user activities in the time period
		const userActivities = await ctx.db
			.query('userActivities')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('timestamp'), startDate),
					q.lte(q.field('timestamp'), endDate)
				)
			)
			.collect();
		userActivities.forEach((activity) => activeUserIds.add(activity.memberId));

		// ALSO add currently logged-in users (users who are online right now)
		// Get all user IDs from workspace members
		const memberUserIds = members.map(member => member.userId);

		// Get current login status for all workspace members
		const userStatuses = await ctx.db
			.query('history')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Add currently online users to active users
		const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
		userStatuses.forEach((status) => {
			// Check if this user is a member of the workspace
			if (memberUserIds.includes(status.userId)) {
				const isRecentlyActive = status.lastSeen > twoMinutesAgo;
				const effectiveStatus = status.status === 'online' && isRecentlyActive ? 'online' : 'offline';

				if (effectiveStatus === 'online') {
					// Find the member ID for this user
					const member = members.find(m => m.userId === status.userId);
					if (member) {
						activeUserIds.add(member._id);
					}
				}
			}
		});

		const activeUserCount = activeUserIds.size;
		const activeUserPercentage = members.length > 0 ? Math.round((activeUserCount / members.length) * 100) : 0;

		// Get active user details for tooltip
		const activeUserDetails = await Promise.all(
			Array.from(activeUserIds).map(async (memberId) => {
				const member = await ctx.db.get(memberId);
				if (!member) return null;

				const user = await ctx.db.get(member.userId);
				return {
					memberId,
					userId: member.userId,
					name: user?.name || 'Unknown User',
					email: user?.email || '',
				};
			})
		);

		// Filter out null values
		const validActiveUsers = activeUserDetails.filter(user => user !== null);

		// Get message activity by day
		const messagesByDay = Array.from({ length: 7 }, (_, i) => {
			const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
			const count = messages.filter((message) => {
				const date = new Date(message._creationTime);
				return date.getDay() === i;
			}).length;
			return { label: dayName, value: count };
		});

		// Get task status distribution
		const taskStatusData = [
			{
				label: 'Completed',
				value: tasks.filter((task) => task.status === 'completed').length,
				color: 'bg-green-500',
			},
			{
				label: 'In Progress',
				value: tasks.filter((task) => task.status === 'in_progress').length,
				color: 'bg-blue-500',
			},
			{
				label: 'Not Started',
				value: tasks.filter((task) => task.status === 'not_started').length,
				color: 'bg-gray-300',
			},
			{
				label: 'On Hold',
				value: tasks.filter((task) => task.status === 'on_hold').length,
				color: 'bg-yellow-500',
			},
			{
				label: 'Cancelled',
				value: tasks.filter((task) => task.status === 'cancelled').length,
				color: 'bg-red-500',
			},
		];

		// Get channel activity
		const channelActivityData = await Promise.all(
			channels.map(async (channel) => {
				const channelMessages = messages.filter(
					(message) => message.channelId === channel._id
				);
				return {
					label: channel.name,
					value: channelMessages.length,
					color: 'bg-secondary',
				};
			})
		);

		// Sort channel activity by message count
		channelActivityData.sort((a, b) => b.value - a.value);

		return {
			totalMembers: members.length,
			activeUserCount,
			activeUserPercentage,
			activeUsers: validActiveUsers,
			totalChannels: channels.length,
			totalMessages: messages.length,
			totalTasks: tasks.length,
			completedTasks,
			messagesByDay,
			taskStatusData,
			channelActivityData,
		};
	},
});

// Get channel activity summary
export const getChannelActivitySummary = query({
	args: {
		workspaceId: v.id('workspaces'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Default to last 30 days if dates not provided
		const endDate = args.endDate || Date.now();
		const startDate = args.startDate || endDate - 30 * 24 * 60 * 60 * 1000;

		// Get all channels in the workspace
		const channels = await ctx.db
			.query('channels')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		// Get activity for each channel
		const channelActivityPromises = channels.map(async (channel) => {
			// Count messages
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_channel_id', (q) => q.eq('channelId', channel._id))
				.filter((q) =>
					q.and(
						q.gte(q.field('_creationTime'), startDate),
						q.lte(q.field('_creationTime'), endDate)
					)
				)
				.collect();
			const messageCount = messages.length;

			// Get total time spent by all users in this channel
			const channelSessions = await ctx.db
				.query('channelSessions')
				.withIndex('by_channel_id', (q) => q.eq('channelId', channel._id))
				.filter((q) =>
					q.and(
						q.gte(q.field('startTime'), startDate),
						q.lte(q.field('startTime'), endDate)
					)
				)
				.collect();

			const totalTimeSpent = channelSessions.reduce((total, session) => {
				return total + (session.duration || 0);
			}, 0);

			// Count unique users who visited the channel
			const uniqueUsers = new Set(
				channelSessions.map((session) => session.memberId)
			);

			// Get message activity by day for this channel
			const messagesByDay = Array.from({ length: 7 }, (_, i) => {
				const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
				const count = messages.filter((message) => {
					const date = new Date(message._creationTime);
					return date.getDay() === i;
				}).length;
				return { day: dayName, count };
			});

			return {
				channel,
				messageCount,
				totalTimeSpent,
				uniqueVisitors: uniqueUsers.size,
				messagesByDay,
			};
		});

		const channelActivity = await Promise.all(channelActivityPromises);

		return channelActivity;
	},
});

// Get message analytics
export const getMessageAnalytics = query({
	args: {
		workspaceId: v.id('workspaces'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
		interval: v.optional(
			v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'))
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Default to last 30 days if dates not provided
		const endDate = args.endDate || Date.now();
		const startDate = args.startDate || endDate - 30 * 24 * 60 * 60 * 1000;
		const interval = args.interval || 'daily';

		// Get all messages in the workspace within the date range
		const messages = await ctx.db
			.query('messages')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('_creationTime'), startDate),
					q.lte(q.field('_creationTime'), endDate)
				)
			)
			.collect();

		// Generate date range for the interval
		const dateRange = eachDayOfInterval({
			start: new Date(startDate),
			end: new Date(endDate),
		});

		// Group messages by date
		const messagesByDate = dateRange.map((date) => {
			const day = startOfDay(date).getTime();
			const nextDay = endOfDay(date).getTime();

			const count = messages.filter(
				(message) =>
					message._creationTime >= day && message._creationTime <= nextDay
			).length;

			return {
				date: format(date, 'yyyy-MM-dd'),
				count,
			};
		});

		// Get top message senders
		const messagesByMember: Record<string, number> = {};
		messages.forEach((message) => {
			const memberId = message.memberId.toString();
			if (!messagesByMember[memberId]) {
				messagesByMember[memberId] = 0;
			}
			messagesByMember[memberId]++;
		});

		// Convert to array and sort
		const topSenders = Object.entries(messagesByMember)
			.map(([memberId, count]) => ({ memberId, count }))
			.sort((a, b) => (b.count as number) - (a.count as number))
			.slice(0, 10);

		// Get member details for top senders
		const topSendersWithDetails = await Promise.all(
			topSenders.map(async (sender) => {
				const member = await ctx.db.get(sender.memberId as Id<'members'>);
				if (!member) return { ...sender, name: 'Unknown' };

				const user = await ctx.db.get(member.userId);
				return {
					...sender,
					name: user?.name || 'Unknown',
				};
			})
		);

		return {
			totalMessages: messages.length,
			messagesByDate,
			topSenders: topSendersWithDetails,
		};
	},
});

// Get task analytics
export const getTaskAnalytics = query({
	args: {
		workspaceId: v.id('workspaces'),
		startDate: v.optional(v.number()),
		endDate: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Default to last 30 days if dates not provided
		const endDate = args.endDate || Date.now();
		const startDate = args.startDate || endDate - 30 * 24 * 60 * 60 * 1000;

		// Get all tasks in the workspace
		const tasks = await ctx.db
			.query('tasks')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.filter((q) =>
				q.and(
					q.gte(q.field('createdAt'), startDate),
					q.lte(q.field('createdAt'), endDate)
				)
			)
			.collect();

		// Task status distribution
		const statusCounts = {
			not_started: 0,
			in_progress: 0,
			completed: 0,
			on_hold: 0,
			cancelled: 0,
		};

		tasks.forEach((task) => {
			if (task.status && statusCounts[task.status] !== undefined) {
				statusCounts[task.status]++;
			} else if (task.completed) {
				statusCounts.completed++;
			} else {
				statusCounts.not_started++;
			}
		});

		// Task priority distribution
		const priorityCounts = {
			low: 0,
			medium: 0,
			high: 0,
		};

		tasks.forEach((task) => {
			if (task.priority && priorityCounts[task.priority] !== undefined) {
				priorityCounts[task.priority]++;
			} else {
				priorityCounts.medium++;
			}
		});

		// Tasks created by day
		const dateRange = eachDayOfInterval({
			start: new Date(startDate),
			end: new Date(endDate),
		});

		const tasksByDate = dateRange.map((date) => {
			const day = startOfDay(date).getTime();
			const nextDay = endOfDay(date).getTime();

			const count = tasks.filter(
				(task) => task.createdAt >= day && task.createdAt <= nextDay
			).length;

			return {
				date: format(date, 'yyyy-MM-dd'),
				count,
			};
		});

		// Tasks by category
		const tasksByCategory: Record<string, number> = {};
		await Promise.all(
			tasks.map(async (task) => {
				if (task.categoryId) {
					const category = await ctx.db.get(task.categoryId);
					if (category) {
						const categoryName = category.name;
						if (!tasksByCategory[categoryName]) {
							tasksByCategory[categoryName] = 0;
						}
						tasksByCategory[categoryName]++;
					}
				} else {
					const uncategorized = 'Uncategorized';
					if (!tasksByCategory[uncategorized]) {
						tasksByCategory[uncategorized] = 0;
					}
					tasksByCategory[uncategorized]++;
				}
			})
		);

		// Convert to array and sort
		const categoryData = Object.entries(tasksByCategory)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => (b.count as number) - (a.count as number));

		return {
			totalTasks: tasks.length,
			completedTasks: tasks.filter((task) => task.completed).length,
			statusCounts,
			priorityCounts,
			tasksByDate,
			categoryData,
		};
	},
});
