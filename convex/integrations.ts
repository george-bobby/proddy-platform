import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';

// Get all integrations for a workspace
export const getByWorkspaceId = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		const integrations = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		return integrations;
	},
});

// Get specific integration for a workspace and service
export const getByWorkspaceAndService = query({
	args: {
		workspaceId: v.id('workspaces'),
		service: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		const integration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', args.service)
			)
			.first();

		return integration;
	},
});

// Connect a service to a workspace
export const connect = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		service: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
		connectedAccountId: v.string(),
		entityId: v.string(),
		metadata: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		// Check if integration already exists
		const existingIntegration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', args.service)
			)
			.first();

		if (existingIntegration) {
			// Update existing integration
			await ctx.db.patch(existingIntegration._id, {
				connectedAccountId: args.connectedAccountId,
				entityId: args.entityId,
				status: 'connected' as const,
				metadata: args.metadata,
				connectedAt: Date.now(),
				connectedBy: member._id,
				lastUsed: Date.now(),
			});
			return existingIntegration._id;
		} else {
			// Create new integration
			const integrationId = await ctx.db.insert('integrations', {
				workspaceId: args.workspaceId,
				service: args.service,
				connectedAccountId: args.connectedAccountId,
				entityId: args.entityId,
				status: 'connected' as const,
				metadata: args.metadata,
				connectedAt: Date.now(),
				connectedBy: member._id,
				lastUsed: Date.now(),
			});
			return integrationId;
		}
	},
});

// Disconnect a service from workspace
export const disconnect = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		service: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		const integration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', args.service)
			)
			.first();

		if (integration) {
			await ctx.db.patch(integration._id, {
				status: 'disconnected' as const,
			});
		}
	},
});

// Update last used timestamp
export const updateLastUsed = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		service: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
	},
	handler: async (ctx, args) => {
		const integration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', args.service)
			)
			.first();

		if (integration) {
			await ctx.db.patch(integration._id, {
				lastUsed: Date.now(),
			});
		}
	},
});

// Initiate connection for any service
export const initiateConnection = action({
	args: {
		workspaceId: v.id('workspaces'),
		service: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		// Create unique entity ID for this workspace-user-service combination
		const entityId = `workspace_${args.workspaceId}_user_${userId}_${args.service}`;

		try {
			// Call Composio v2 API to initiate connection
			const response = await fetch(
				'https://backend.composio.dev/api/v2/connectedAccounts/initiateConnection',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': process.env.COMPOSIO_API_KEY!,
					},
					body: JSON.stringify({
						integrationId: args.service,
						entityId: entityId,
						data: {
							redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${args.workspaceId}/manage?tab=workspace&service=${args.service}&connected=true`,
						},
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio API error:', errorData);
				throw new Error(
					`Failed to initiate ${args.service} connection: ${response.status}`
				);
			}

			const data = await response.json();

			return {
				redirectUrl: data.redirectUrl,
				entityId: entityId,
				connectedAccountId: data.connectedAccountId,
				service: args.service,
			};
		} catch (error) {
			console.error(`Error initiating ${args.service} connection:`, error);
			throw new Error(`Failed to initiate ${args.service} connection`);
		}
	},
});

// Check connection status for any service
export const checkConnectionStatus = action({
	args: {
		entityId: v.string(),
		service: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
	},
	handler: async (_ctx, args) => {
		try {
			// Call Composio v2 API to check connection status
			const response = await fetch(
				`https://backend.composio.dev/api/v2/connectedAccounts?entityId=${args.entityId}`,
				{
					method: 'GET',
					headers: {
						'X-API-Key': process.env.COMPOSIO_API_KEY!,
					},
				}
			);

			if (!response.ok) {
				return { connected: false, error: `API error: ${response.status}` };
			}

			const data = await response.json();
			const serviceConnection = data.items?.find(
				(conn: any) => conn.appName === args.service
			);

			return {
				connected: !!serviceConnection && serviceConnection.status === 'ACTIVE',
				connectionId: serviceConnection?.id,
				status: serviceConnection?.status,
				service: args.service,
			};
		} catch (error) {
			console.error(`Error checking ${args.service} connection:`, error);
			return { connected: false, error: 'Failed to check connection status' };
		}
	},
});

// ===== GITHUB-SPECIFIC FUNCTIONS =====

// Get GitHub repository for a workspace
export const getGitHubRepository = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		const integration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', 'github')
			)
			.first();

		if (!integration || integration.status !== 'connected') {
			return null;
		}

		// Return integration with repository metadata
		return {
			...integration,
			// Extract repository info from metadata
			owner: integration.metadata?.owner,
			repo: integration.metadata?.repo,
			fullName: integration.metadata?.fullName,
			description: integration.metadata?.description,
			isPrivate: integration.metadata?.isPrivate,
		};
	},
});

// Connect a GitHub repository to a workspace
export const connectGitHubRepository = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		owner: v.string(),
		repo: v.string(),
		fullName: v.string(),
		description: v.optional(v.string()),
		isPrivate: v.boolean(),
		connectedAccountId: v.string(),
		entityId: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		// Check if GitHub integration already exists
		const existingIntegration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', 'github')
			)
			.first();

		// Prepare repository metadata
		const repositoryMetadata = {
			owner: args.owner,
			repo: args.repo,
			fullName: args.fullName,
			description: args.description,
			isPrivate: args.isPrivate,
		};

		if (existingIntegration) {
			// Update existing integration with repository info
			await ctx.db.patch(existingIntegration._id, {
				connectedAccountId: args.connectedAccountId,
				entityId: args.entityId,
				status: 'connected' as const,
				metadata: repositoryMetadata,
				connectedAt: Date.now(),
				connectedBy: member._id,
				lastUsed: Date.now(),
			});
			return existingIntegration._id;
		} else {
			// Create new GitHub integration with repository info
			const integrationId = await ctx.db.insert('integrations', {
				workspaceId: args.workspaceId,
				service: 'github' as const,
				connectedAccountId: args.connectedAccountId,
				entityId: args.entityId,
				status: 'connected' as const,
				metadata: repositoryMetadata,
				connectedAt: Date.now(),
				connectedBy: member._id,
				lastUsed: Date.now(),
			});
			return integrationId;
		}
	},
});

// Disconnect GitHub repository from workspace
export const disconnectGitHubRepository = mutation({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.db
			.query('members')
			.withIndex('by_workspace_id_user_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('userId', userId)
			)
			.first();

		if (!member) throw new Error('Unauthorized');

		const integration = await ctx.db
			.query('integrations')
			.withIndex('by_workspace_service', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('service', 'github')
			)
			.first();

		if (integration) {
			await ctx.db.patch(integration._id, {
				status: 'disconnected' as const,
				metadata: undefined, // Clear repository metadata
			});
		}
	},
});

// Initiate GitHub connection using Composio AgentAuth
export const initiateGitHubConnection = action({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		// Create unique entity ID for this workspace-user combination
		const entityId = `workspace_${args.workspaceId}_user_${userId}_github`;

		try {
			// Call Composio v2 API to initiate GitHub connection
			const response = await fetch(
				'https://backend.composio.dev/api/v2/connectedAccounts/initiateConnection',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': process.env.COMPOSIO_API_KEY!,
					},
					body: JSON.stringify({
						integrationId: 'github',
						entityId: entityId,
						data: {
							redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${args.workspaceId}/manage?tab=workspace&service=github&connected=true`,
						},
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio API error:', errorData);
				throw new Error(
					`Failed to initiate GitHub connection: ${response.status}`
				);
			}

			const data = await response.json();

			return {
				redirectUrl: data.redirectUrl,
				entityId: entityId,
				connectedAccountId: data.connectedAccountId,
			};
		} catch (error) {
			console.error('Error initiating GitHub connection:', error);
			throw new Error('Failed to initiate GitHub connection');
		}
	},
});

// Fetch user's GitHub repositories
export const fetchGitHubRepositories = action({
	args: {
		workspaceId: v.id('workspaces'),
		entityId: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		try {
			// Call Composio v2 API to execute GitHub action to list repositories
			const response = await fetch(
				'https://backend.composio.dev/api/v2/actions/GITHUB_LIST_REPOSITORIES_FOR_THE_AUTHENTICATED_USER/execute',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': process.env.COMPOSIO_API_KEY!,
					},
					body: JSON.stringify({
						entityId: args.entityId,
						input: {
							per_page: 100,
							sort: 'updated',
							direction: 'desc',
						},
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.text();
				console.error('GitHub repositories fetch error:', errorData);
				throw new Error(`Failed to fetch repositories: ${response.status}`);
			}

			const data = await response.json();

			if (!data.successful) {
				throw new Error(data.error || 'Failed to fetch repositories');
			}

			// Transform repository data - v2 API response structure
			const repositories = data.data.map((repo: any) => ({
				id: repo.id,
				name: repo.name,
				fullName: repo.full_name,
				owner: repo.owner.login,
				description: repo.description,
				isPrivate: repo.private,
				updatedAt: repo.updated_at,
				language: repo.language,
				stargazersCount: repo.stargazers_count,
				forksCount: repo.forks_count,
			}));

			return repositories;
		} catch (error) {
			console.error('Error fetching GitHub repositories:', error);
			throw new Error('Failed to fetch GitHub repositories');
		}
	},
});

// Check GitHub connection status
export const checkGitHubConnection = action({
	args: {
		entityId: v.string(),
	},
	handler: async (_ctx, args) => {
		try {
			// Call Composio v2 API to check connection status
			const response = await fetch(
				`https://backend.composio.dev/api/v2/connectedAccounts?entityId=${args.entityId}`,
				{
					method: 'GET',
					headers: {
						'X-API-Key': process.env.COMPOSIO_API_KEY!,
					},
				}
			);

			if (!response.ok) {
				return { connected: false, error: `API error: ${response.status}` };
			}

			const data = await response.json();
			const githubConnection = data.items?.find(
				(conn: any) => conn.appName === 'github'
			);

			return {
				connected: !!githubConnection && githubConnection.status === 'ACTIVE',
				connectionId: githubConnection?.id,
				status: githubConnection?.status,
			};
		} catch (error) {
			console.error('Error checking GitHub connection:', error);
			return { connected: false, error: 'Failed to check connection status' };
		}
	},
});
