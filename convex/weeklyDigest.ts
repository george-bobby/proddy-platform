import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { query, mutation, internalMutation } from './_generated/server';
import { QueryCtx } from './_generated/server';
// Note: date-fns is not available in Convex runtime, using native Date methods

/**
 * Get weekly digest data for a user across all their workspaces
 */
export const getUserWeeklyDigest = query({
	args: {
		userId: v.id('users'),
		startDate: v.number(),
		endDate: v.number(),
	},
	handler: async (ctx, args) => {
		// Get all workspaces the user is a member of
		const memberships = await ctx.db
			.query('members')
			.withIndex('by_user_id', (q) => q.eq('userId', args.userId))
			.collect();

		const workspaceDigests = [];
		let totalMessages = 0;
		let totalTasks = 0;

		for (const membership of memberships) {
			const workspace = await ctx.db.get(membership.workspaceId);
			if (!workspace) continue;

			// Get workspace stats for the week
			const workspaceStats = await getWorkspaceWeeklyStats(ctx, {
				workspaceId: membership.workspaceId,
				startDate: args.startDate,
				endDate: args.endDate,
			});

			if (workspaceStats) {
				workspaceDigests.push({
					workspaceName: workspace.name,
					workspaceUrl: `${process.env.DEPLOY_URL}/workspace/${workspace._id}`,
					stats: workspaceStats.stats,
					topChannels: workspaceStats.topChannels,
					recentTasks: workspaceStats.recentTasks,
				});

				totalMessages += workspaceStats.stats.totalMessages;
				totalTasks += workspaceStats.stats.totalTasks;
			}
		}

		return {
			workspaces: workspaceDigests,
			totalStats: {
				totalMessages,
				totalTasks,
				totalWorkspaces: workspaceDigests.length,
			},
		};
	},
});

/**
 * Get weekly stats for a specific workspace
 */
async function getWorkspaceWeeklyStats(
	ctx: QueryCtx,
	args: {
		workspaceId: any;
		startDate: number;
		endDate: number;
	}
) {
	// Get messages count
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_workspace_id', (q: any) =>
			q.eq('workspaceId', args.workspaceId)
		)
		.filter((q: any) =>
			q.and(
				q.gte(q.field('_creationTime'), args.startDate),
				q.lte(q.field('_creationTime'), args.endDate)
			)
		)
		.collect();

	// Get tasks count
	const tasks = await ctx.db
		.query('tasks')
		.withIndex('by_workspace_id', (q: any) =>
			q.eq('workspaceId', args.workspaceId)
		)
		.filter((q: any) =>
			q.and(
				q.gte(q.field('createdAt'), args.startDate),
				q.lte(q.field('createdAt'), args.endDate)
			)
		)
		.collect();

	const completedTasks = tasks.filter(
		(task: any) => task.completed || task.status === 'completed'
	);

	// Get active users (users who sent messages)
	const activeUserIds = new Set(messages.map((msg: any) => msg.memberId));

	// Get top channels by message count
	const channelMessageCounts: { [key: string]: number } = {};
	for (const message of messages) {
		if (message.channelId) {
			channelMessageCounts[message.channelId] =
				(channelMessageCounts[message.channelId] || 0) + 1;
		}
	}

	const topChannels = [];
	for (const channelId in channelMessageCounts) {
		const count = channelMessageCounts[channelId];
		const channel = await ctx.db.get(channelId as any);
		if (channel && 'name' in channel && count) {
			topChannels.push({
				name: channel.name,
				messageCount: count,
			});
		}
	}

	// Sort by message count and take top 5
	topChannels.sort((a, b) => b.messageCount - a.messageCount);

	// Get recent tasks (created or updated this week)
	const recentTasks = tasks.slice(0, 5).map((task: any) => ({
		title: task.title,
		status: task.completed ? 'completed' : task.status || 'not_started',
		dueDate: task.dueDate
			? new Date(task.dueDate).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
				})
			: undefined,
	}));

	return {
		stats: {
			totalMessages: messages.length,
			totalTasks: tasks.length,
			completedTasks: completedTasks.length,
			activeUsers: activeUserIds.size,
		},
		topChannels: topChannels.slice(0, 3),
		recentTasks,
	};
}

/**
 * Get all users who have weekly digest enabled for a specific day
 */
export const getUsersForWeeklyDigest = query({
	args: {
		dayOfWeek: v.union(
			v.literal('monday'),
			v.literal('tuesday'),
			v.literal('wednesday'),
			v.literal('thursday'),
			v.literal('friday'),
			v.literal('saturday'),
			v.literal('sunday')
		),
	},
	handler: async (ctx, args) => {
		// Get all user preferences where weekly digest is enabled for the specified day
		const preferences = await ctx.db
			.query('userPreferences')
			.filter((q) =>
				q.and(
					q.eq(q.field('settings.notifications.weeklyDigest'), true),
					q.eq(
						q.field('settings.notifications.weeklyDigestDay'),
						args.dayOfWeek
					)
				)
			)
			.collect();

		const users = [];
		for (const pref of preferences) {
			const user = await ctx.db.get(pref.userId);
			if (user && user.email) {
				users.push({
					userId: pref.userId,
					email: user.email,
					name: user.name || 'User',
				});
			}
		}

		return users;
	},
});

/**
 * Internal version for use in mutations
 */
async function getUsersForWeeklyDigestInternal(
	ctx: QueryCtx,
	dayOfWeek: string
) {
	// Get all user preferences where weekly digest is enabled for the specified day
	const preferences = await ctx.db
		.query('userPreferences')
		.filter((q) =>
			q.and(
				q.eq(q.field('settings.notifications.weeklyDigest'), true),
				q.eq(q.field('settings.notifications.weeklyDigestDay'), dayOfWeek)
			)
		)
		.collect();

	const users = [];
	for (const pref of preferences) {
		const user = await ctx.db.get(pref.userId);
		if (user && user.email) {
			users.push({
				userId: pref.userId,
				email: user.email,
				name: user.name || 'User',
			});
		}
	}

	return users;
}

/**
 * Internal version for use in mutations
 */
async function getUserWeeklyDigestInternal(
	ctx: QueryCtx,
	args: {
		userId: any;
		startDate: number;
		endDate: number;
	}
) {
	// Get all workspaces the user is a member of
	const memberships = await ctx.db
		.query('members')
		.withIndex('by_user_id', (q: any) => q.eq('userId', args.userId))
		.collect();

	const workspaceDigests = [];
	let totalMessages = 0;
	let totalTasks = 0;

	for (const membership of memberships) {
		const workspace = await ctx.db.get(membership.workspaceId);
		if (!workspace) continue;

		// Get workspace stats for the week
		const workspaceStats = await getWorkspaceWeeklyStats(ctx, {
			workspaceId: membership.workspaceId,
			startDate: args.startDate,
			endDate: args.endDate,
		});

		if (workspaceStats) {
			workspaceDigests.push({
				workspaceName: workspace.name,
				workspaceUrl: `${process.env.DEPLOY_URL}/workspace/${workspace._id}`,
				stats: workspaceStats.stats,
				topChannels: workspaceStats.topChannels,
				recentTasks: workspaceStats.recentTasks,
			});

			totalMessages += workspaceStats.stats.totalMessages;
			totalTasks += workspaceStats.stats.totalTasks;
		}
	}

	return {
		workspaces: workspaceDigests,
		totalStats: {
			totalMessages,
			totalTasks,
			totalWorkspaces: workspaceDigests.length,
		},
	};
}

/**
 * Send weekly digest emails (to be called by scheduled function)
 */
export const sendWeeklyDigests = internalMutation({
	args: {
		dayOfWeek: v.union(
			v.literal('monday'),
			v.literal('tuesday'),
			v.literal('wednesday'),
			v.literal('thursday'),
			v.literal('friday'),
			v.literal('saturday'),
			v.literal('sunday')
		),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const currentDate = new Date(now);

		// Get start of week (Monday)
		const dayOfWeek = currentDate.getDay();
		const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
		const weekStart = new Date(currentDate);
		weekStart.setDate(currentDate.getDate() - daysToMonday);
		weekStart.setHours(0, 0, 0, 0);

		// Get end of week (Sunday)
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);
		weekEnd.setHours(23, 59, 59, 999);

		const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

		// Get users who should receive digest today
		const users = await getUsersForWeeklyDigestInternal(ctx, args.dayOfWeek);

		const results = [];

		for (const user of users) {
			try {
				// Get user's weekly digest data
				const digestData = await getUserWeeklyDigestInternal(ctx, {
					userId: user.userId,
					startDate: weekStart.getTime(),
					endDate: weekEnd.getTime(),
				});

				// Only send if user has activity in any workspace
				if (
					digestData.totalStats.totalMessages > 0 ||
					digestData.totalStats.totalTasks > 0
				) {
					// Call the email API
					const emailResponse = await fetch(
						`${process.env.NEXT_PUBLIC_APP_URL}/api/email/weekly-digest`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								to: user.email,
								firstName: user.name.split(' ')[0],
								weekRange,
								workspaces: digestData.workspaces,
								totalStats: digestData.totalStats,
							}),
						}
					);

					const emailResult = await emailResponse.json();

					results.push({
						userId: user.userId,
						email: user.email,
						success: emailResponse.ok,
						result: emailResult,
					});
				} else {
					results.push({
						userId: user.userId,
						email: user.email,
						success: true,
						skipped: true,
						reason: 'No activity this week',
					});
				}
			} catch (error) {
				results.push({
					userId: user.userId,
					email: user.email,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}

		return {
			dayOfWeek: args.dayOfWeek,
			weekRange,
			totalUsers: users.length,
			results,
		};
	},
});

/**
 * Test function to verify weekly digest functionality
 */
export const testWeeklyDigest = mutation({
	args: {
		testEmail: v.string(),
		dayOfWeek: v.optional(
			v.union(
				v.literal('monday'),
				v.literal('tuesday'),
				v.literal('wednesday'),
				v.literal('thursday'),
				v.literal('friday'),
				v.literal('saturday'),
				v.literal('sunday')
			)
		),
	},
	handler: async (ctx, args) => {
		const testDay = args.dayOfWeek || 'monday';

		// Create test data for the email
		const testData = {
			to: args.testEmail,
			firstName: 'Test User',
			weekRange: 'Dec 16 - Dec 22, 2024',
			workspaces: [
				{
					workspaceName: 'Test Workspace',
					workspaceUrl: `${process.env.DEPLOY_URL}/workspace/test`,
					stats: {
						totalMessages: 25,
						totalTasks: 8,
						completedTasks: 5,
						activeUsers: 3,
					},
					topChannels: [
						{ name: 'general', messageCount: 15 },
						{ name: 'development', messageCount: 10 },
					],
					recentTasks: [
						{
							title: 'Complete project setup',
							status: 'completed',
							dueDate: 'Dec 20',
						},
						{
							title: 'Review code changes',
							status: 'in_progress',
							dueDate: 'Dec 22',
						},
					],
				},
			],
			totalStats: {
				totalMessages: 25,
				totalTasks: 8,
				totalWorkspaces: 1,
			},
		};

		try {
			// Call the email API directly
			const emailResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/email/weekly-digest`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(testData),
				}
			);

			const emailResult = await emailResponse.json();

			return {
				success: emailResponse.ok,
				testData,
				emailResult,
				message: emailResponse.ok
					? 'Test weekly digest email sent successfully!'
					: 'Failed to send test email',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				message: 'Failed to send test weekly digest email',
			};
		}
	},
});
