import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';

// Composio v3 API Base URL
const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3';

// Supported toolkits
const SUPPORTED_TOOLKITS = [
	'github',
	'gmail',
	'slack',
	'jira',
	'notion',
	'clickup'
] as const;

type SupportedToolkit = typeof SUPPORTED_TOOLKITS[number];

// ===== AUTH CONFIGS MANAGEMENT (v3) =====

// Get all auth configs for a workspace
export const getAuthConfigs = query({
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

		const authConfigs = await ctx.db
			.query('auth_configs')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		return authConfigs;
	},
});

// Get auth config by workspace and toolkit
export const getAuthConfigByToolkit = query({
	args: {
		workspaceId: v.id('workspaces'),
		toolkit: v.union(
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

		const authConfig = await ctx.db
			.query('auth_configs')
			.withIndex('by_workspace_toolkit', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('toolkit', args.toolkit)
			)
			.first();

		return authConfig;
	},
});

// Store auth config in database (internal mutation)
export const storeAuthConfig = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		toolkit: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
		name: v.string(),
		type: v.union(
			v.literal('use_composio_managed_auth'),
			v.literal('use_custom_auth'),
			v.literal('service_connection'),
			v.literal('no_auth')
		),
		authScheme: v.optional(v.string()),
		composioAuthConfigId: v.string(),
		credentials: v.optional(v.any()),
		isComposioManaged: v.boolean(),
		createdBy: v.id('members'),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const authConfigId = await ctx.db.insert('auth_configs', {
			workspaceId: args.workspaceId,
			toolkit: args.toolkit,
			name: args.name,
			type: args.type,
			authScheme: args.authScheme,
			composioAuthConfigId: args.composioAuthConfigId,
			credentials: args.credentials,
			isComposioManaged: args.isComposioManaged,
			isDisabled: false,
			createdAt: now,
			updatedAt: now,
			createdBy: args.createdBy,
		});

		return authConfigId;
	},
});

// Create auth config with Composio-managed authentication
export const createAuthConfig = action({
	args: {
		workspaceId: v.id('workspaces'),
		toolkit: v.union(
			v.literal('github'),
			v.literal('gmail'),
			v.literal('slack'),
			v.literal('jira'),
			v.literal('notion'),
			v.literal('clickup')
		),
		name: v.string(),
		type: v.optional(v.union(
			v.literal('use_composio_managed_auth'),
			v.literal('use_custom_auth')
		)),
		authScheme: v.optional(v.string()),
		credentials: v.optional(v.any()),
	},
	handler: async (ctx, args): Promise<{
		id: Id<'auth_configs'>;
		composioId: string;
		[key: string]: any;
	}> => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
			throw new Error('Only workspace owners and admins can create auth configs');
		}

		try {
			// Create auth config in Composio v3
			const response = await fetch(`${COMPOSIO_API_BASE}/auth_configs`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
				body: JSON.stringify({
					toolkit: args.toolkit,
					name: args.name,
					type: args.type || 'use_composio_managed_auth',
					authScheme: args.authScheme,
					credentials: args.credentials,
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio auth config creation error:', errorData);
				throw new Error(`Failed to create auth config: ${response.status}`);
			}

			const composioAuthConfig = await response.json();

			// Store in our database
			const authConfigId: Id<'auth_configs'> = await ctx.runMutation(api.integrations.storeAuthConfig, {
				workspaceId: args.workspaceId,
				toolkit: args.toolkit,
				name: args.name,
				type: args.type || 'use_composio_managed_auth',
				authScheme: args.authScheme,
				composioAuthConfigId: composioAuthConfig.id,
				credentials: args.credentials,
				isComposioManaged: args.type === 'use_composio_managed_auth' || !args.type,
				createdBy: member._id,
			});

			return {
				id: authConfigId,
				composioId: composioAuthConfig.id,
				...composioAuthConfig,
			};
		} catch (error) {
			console.error('Error creating auth config:', error);
			throw new Error('Failed to create auth config');
		}
	},
});

// ===== CONNECTED ACCOUNTS MANAGEMENT (v3) =====

// Get auth config by ID (internal query)
export const getAuthConfigById = query({
	args: {
		authConfigId: v.id('auth_configs'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.authConfigId);
	},
});

// Initiate connection for a toolkit using v3 API
export const initiateConnection = action({
	args: {
		workspaceId: v.id('workspaces'),
		authConfigId: v.id('auth_configs'),
		userId: v.string(), // User identifier for Composio
		callbackUrl: v.optional(v.string()),
	},
	handler: async (ctx, args): Promise<{
		redirectUrl: string;
		connectionId: string;
		authConfigId: Id<'auth_configs'>;
		toolkit: string;
	}> => {
		const currentUserId = await getAuthUserId(ctx);
		if (!currentUserId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		// Get auth config
		const authConfig: any = await ctx.runQuery(api.integrations.getAuthConfigById, {
			authConfigId: args.authConfigId,
		});
		if (!authConfig || authConfig.workspaceId !== args.workspaceId) {
			throw new Error('Auth config not found');
		}

		try {
			// Initiate connection using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
				body: JSON.stringify({
					userId: args.userId,
					authConfigId: authConfig.composioAuthConfigId,
					callbackUrl: args.callbackUrl || `${process.env.SITE_URL}/workspace/${args.workspaceId}/integrations/callback`,
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio connection initiation error:', errorData);
				throw new Error(`Failed to initiate connection: ${response.status}`);
			}

			const connectionData = await response.json();

			return {
				redirectUrl: connectionData.redirectUrl,
				connectionId: connectionData.id,
				authConfigId: args.authConfigId,
				toolkit: authConfig.toolkit,
			};
		} catch (error) {
			console.error('Error initiating connection:', error);
			throw new Error('Failed to initiate connection');
		}
	},
});

// Store connected account in database (internal mutation)
export const storeConnectedAccount = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		authConfigId: v.id('auth_configs'),
		userId: v.string(),
		composioAccountId: v.string(),
		toolkit: v.string(),
		status: v.union(
			v.literal('ACTIVE'),
			v.literal('PENDING'),
			v.literal('EXPIRED'),
			v.literal('ERROR'),
			v.literal('DISABLED')
		),
		statusReason: v.optional(v.string()),
		metadata: v.optional(v.any()),
		testRequestEndpoint: v.optional(v.string()),
		connectedBy: v.id('members'),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const connectedAccountId = await ctx.db.insert('connected_accounts', {
			workspaceId: args.workspaceId,
			authConfigId: args.authConfigId,
			userId: args.userId,
			composioAccountId: args.composioAccountId,
			toolkit: args.toolkit,
			status: args.status,
			statusReason: args.statusReason,
			metadata: args.metadata,
			testRequestEndpoint: args.testRequestEndpoint,
			isDisabled: false,
			connectedAt: now,
			lastUsed: now,
			connectedBy: args.connectedBy,
		});

		return connectedAccountId;
	},
});

// Get connected accounts for workspace
export const getConnectedAccounts = query({
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

		const connectedAccounts = await ctx.db
			.query('connected_accounts')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		return connectedAccounts;
	},
});

// Check connection status using v3 API
export const checkConnectionStatus = action({
	args: {
		composioAccountId: v.string(),
	},
	handler: async (_ctx, args) => {
		try {
			// Check connection status using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts/${args.composioAccountId}`, {
				method: 'GET',
				headers: {
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
			});

			if (!response.ok) {
				return { connected: false, error: `API error: ${response.status}` };
			}

			const data = await response.json();

			return {
				connected: data.status === 'ACTIVE',
				status: data.status,
				statusReason: data.statusReason,
				id: data.id,
				toolkit: data.toolkit?.slug,
			};
		} catch (error) {
			console.error('Error checking connection status:', error);
			return { connected: false, error: 'Failed to check status' };
		}
	},
});

// Get connected account by ID (internal query)
export const getConnectedAccountById = query({
	args: {
		connectedAccountId: v.id('connected_accounts'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.connectedAccountId);
	},
});

// Get connected account by Composio ID (internal query)
export const getConnectedAccountByComposioId = query({
	args: {
		composioAccountId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('connected_accounts')
			.filter((q: any) => q.eq(q.field('composioAccountId'), args.composioAccountId))
			.first();
	},
});

// Update connected account status (internal mutation)
export const updateConnectedAccountStatus = mutation({
	args: {
		connectedAccountId: v.id('connected_accounts'),
		status: v.union(
			v.literal('ACTIVE'),
			v.literal('PENDING'),
			v.literal('EXPIRED'),
			v.literal('ERROR'),
			v.literal('DISABLED')
		),
		isDisabled: v.optional(v.boolean()),
		lastUsed: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const updateData: any = {
			status: args.status,
		};

		if (args.isDisabled !== undefined) {
			updateData.isDisabled = args.isDisabled;
		}

		if (args.lastUsed !== undefined) {
			updateData.lastUsed = args.lastUsed;
		}

		await ctx.db.patch(args.connectedAccountId, updateData);
	},
});

// Disconnect connected account
export const disconnectAccount = action({
	args: {
		workspaceId: v.id('workspaces'),
		connectedAccountId: v.id('connected_accounts'),
	},
	handler: async (ctx, args): Promise<{ success: boolean }> => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
			throw new Error('Only workspace owners and admins can disconnect accounts');
		}

		// Get connected account
		const connectedAccount: any = await ctx.runQuery(api.integrations.getConnectedAccountById, {
			connectedAccountId: args.connectedAccountId,
		});
		if (!connectedAccount || connectedAccount.workspaceId !== args.workspaceId) {
			throw new Error('Connected account not found');
		}

		try {
			// Disable connected account in Composio v3
			const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts/${connectedAccount.composioAccountId}`, {
				method: 'DELETE',
				headers: {
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
			});

			if (!response.ok) {
				console.error('Failed to disconnect from Composio:', response.status);
			}

			// Update status in our database
			await ctx.runMutation(api.integrations.updateConnectedAccountStatus, {
				connectedAccountId: args.connectedAccountId,
				status: 'DISABLED',
				isDisabled: true,
			});

			return { success: true };
		} catch (error) {
			console.error('Error disconnecting account:', error);
			throw new Error('Failed to disconnect account');
		}
	},
});

// ===== MCP SERVER MANAGEMENT (v3 + AgentAuth) =====

// Create MCP server for AI agents
export const createMCPServer = action({
	args: {
		workspaceId: v.id('workspaces'),
		name: v.string(),
		toolkitConfigs: v.array(v.object({
			toolkit: v.string(),
			authConfigId: v.string(),
			allowedTools: v.array(v.string()),
		})),
		useComposioManagedAuth: v.optional(v.boolean()),
	},
	handler: async (ctx, args): Promise<{
		id: Id<'mcp_servers'>;
		composioId: string;
		[key: string]: any;
	}> => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
			throw new Error('Only workspace owners and admins can create MCP servers');
		}

		try {
			// Create MCP server using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/mcp/servers`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
				body: JSON.stringify({
					name: args.name,
					toolkitConfigs: args.toolkitConfigs,
					authOptions: {
						useComposioManagedAuth: args.useComposioManagedAuth ?? true,
					},
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio MCP server creation error:', errorData);
				throw new Error(`Failed to create MCP server: ${response.status}`);
			}

			const mcpServerData = await response.json();

			// Store in our database
			const mcpServerId: Id<'mcp_servers'> = await ctx.runMutation(api.integrations.storeMCPServer, {
				workspaceId: args.workspaceId,
				name: args.name,
				composioServerId: mcpServerData.id,
				toolkitConfigs: args.toolkitConfigs,
				useComposioManagedAuth: args.useComposioManagedAuth ?? true,
				createdBy: member._id,
			});

			return {
				id: mcpServerId,
				composioId: mcpServerData.id,
				...mcpServerData,
			};
		} catch (error) {
			console.error('Error creating MCP server:', error);
			throw new Error('Failed to create MCP server');
		}
	},
});

// Store MCP server in database (internal mutation)
export const storeMCPServer = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		name: v.string(),
		composioServerId: v.string(),
		toolkitConfigs: v.array(v.object({
			toolkit: v.string(),
			authConfigId: v.string(),
			allowedTools: v.array(v.string()),
		})),
		useComposioManagedAuth: v.boolean(),
		createdBy: v.id('members'),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		const mcpServerId = await ctx.db.insert('mcp_servers', {
			workspaceId: args.workspaceId,
			name: args.name,
			composioServerId: args.composioServerId,
			toolkitConfigs: args.toolkitConfigs,
			useComposioManagedAuth: args.useComposioManagedAuth,
			serverUrls: undefined,
			isActive: true,
			createdAt: now,
			updatedAt: now,
			createdBy: args.createdBy,
		});

		return mcpServerId;
	},
});

// Get MCP servers for workspace
export const getMCPServers = query({
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

		const mcpServers = await ctx.db
			.query('mcp_servers')
			.withIndex('by_workspace_id', (q) =>
				q.eq('workspaceId', args.workspaceId)
			)
			.collect();

		return mcpServers;
	},
});

// Get MCP server by ID (internal query)
export const getMCPServerById = query({
	args: {
		mcpServerId: v.id('mcp_servers'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.mcpServerId);
	},
});

// Update MCP server URLs (internal mutation)
export const updateMCPServerUrls = mutation({
	args: {
		mcpServerId: v.id('mcp_servers'),
		serverUrls: v.any(),
		updatedAt: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.mcpServerId, {
			serverUrls: args.serverUrls,
			updatedAt: args.updatedAt,
		});
	},
});

// Generate MCP server URLs for AI agents
export const generateMCPServerUrls = action({
	args: {
		workspaceId: v.id('workspaces'),
		mcpServerId: v.id('mcp_servers'),
		userIds: v.optional(v.array(v.string())),
		connectedAccountIds: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args): Promise<any> => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		// Get MCP server
		const mcpServer: any = await ctx.runQuery(api.integrations.getMCPServerById, {
			mcpServerId: args.mcpServerId,
		});
		if (!mcpServer || mcpServer.workspaceId !== args.workspaceId) {
			throw new Error('MCP server not found');
		}

		try {
			// Generate URLs using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/mcp/servers/${mcpServer.composioServerId}/urls`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
				body: JSON.stringify({
					userIds: args.userIds || [userId],
					connectedAccountIds: args.connectedAccountIds,
					managedAuthByComposio: mcpServer.useComposioManagedAuth,
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio MCP URL generation error:', errorData);
				throw new Error(`Failed to generate MCP URLs: ${response.status}`);
			}

			const urlData = await response.json();

			// Update server with generated URLs
			await ctx.runMutation(api.integrations.updateMCPServerUrls, {
				mcpServerId: args.mcpServerId,
				serverUrls: urlData,
				updatedAt: Date.now(),
			});

			return urlData;
		} catch (error) {
			console.error('Error generating MCP server URLs:', error);
			throw new Error('Failed to generate MCP server URLs');
		}
	},
});

// ===== TOOL EXECUTION (v3) =====

// Execute tool using v3 API
export const executeTool = action({
	args: {
		workspaceId: v.id('workspaces'),
		toolSlug: v.string(),
		connectedAccountId: v.optional(v.string()),
		userId: v.string(),
		arguments: v.any(),
		allowTracing: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const currentUserId = await getAuthUserId(ctx);
		if (!currentUserId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		try {
			// Execute tool using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/tools/execute/${args.toolSlug}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
				body: JSON.stringify({
					userId: args.userId,
					connectedAccountId: args.connectedAccountId,
					arguments: args.arguments,
					allowTracing: args.allowTracing ?? false,
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio tool execution error:', errorData);
				throw new Error(`Failed to execute tool: ${response.status}`);
			}

			const result = await response.json();

			// Update last used timestamp for connected account
			if (args.connectedAccountId) {
				const connectedAccount: any = await ctx.runQuery(api.integrations.getConnectedAccountByComposioId, {
					composioAccountId: args.connectedAccountId,
				});

				if (connectedAccount) {
					await ctx.runMutation(api.integrations.updateConnectedAccountStatus, {
						connectedAccountId: connectedAccount._id,
						status: connectedAccount.status,
						lastUsed: Date.now(),
					});
				}
			}

			return result;
		} catch (error) {
			console.error('Error executing tool:', error);
			throw new Error('Failed to execute tool');
		}
	},
});

// Get available tools for a toolkit
export const getToolkitTools = action({
	args: {
		toolkit: v.string(),
		authConfigId: v.optional(v.string()),
	},
	handler: async (_ctx, args) => {
		try {
			// Get tools using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/tools?toolkit=${args.toolkit}`, {
				method: 'GET',
				headers: {
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio tools fetch error:', errorData);
				throw new Error(`Failed to fetch tools: ${response.status}`);
			}

			const data = await response.json();
			return data.items || [];
		} catch (error) {
			console.error('Error fetching toolkit tools:', error);
			throw new Error('Failed to fetch toolkit tools');
		}
	},
});

// ===== AGENTAUTH HELPER ACTIONS =====

// Complete connection after OAuth callback (AgentAuth)
export const completeConnection = action({
	args: {
		workspaceId: v.id('workspaces'),
		authConfigId: v.id('auth_configs'),
		userId: v.string(),
		connectionData: v.any(), // Data from OAuth callback
	},
	handler: async (ctx, args): Promise<{
		id: Id<'connected_accounts'>;
		composioId: string;
		status: string;
	}> => {
		const currentUserId = await getAuthUserId(ctx);
		if (!currentUserId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		// Get auth config
		const authConfig: any = await ctx.runQuery(api.integrations.getAuthConfigById, {
			authConfigId: args.authConfigId,
		});
		if (!authConfig || authConfig.workspaceId !== args.workspaceId) {
			throw new Error('Auth config not found');
		}

		try {
			// Store connected account
			const connectedAccountId: Id<'connected_accounts'> = await ctx.runMutation(api.integrations.storeConnectedAccount, {
				workspaceId: args.workspaceId,
				authConfigId: args.authConfigId,
				userId: args.userId,
				composioAccountId: args.connectionData.id,
				toolkit: authConfig.toolkit,
				status: args.connectionData.status || 'ACTIVE',
				statusReason: args.connectionData.statusReason,
				metadata: args.connectionData.metadata,
				testRequestEndpoint: args.connectionData.testRequestEndpoint,
				connectedBy: member._id,
			});

			return {
				id: connectedAccountId,
				composioId: args.connectionData.id,
				status: args.connectionData.status || 'ACTIVE',
			};
		} catch (error) {
			console.error('Error completing connection:', error);
			throw new Error('Failed to complete connection');
		}
	},
});

// Get auth config creation fields for a toolkit
export const getAuthConfigFields = action({
	args: {
		toolkit: v.string(),
		authScheme: v.string(),
		requiredOnly: v.optional(v.boolean()),
	},
	handler: async (_ctx, args) => {
		try {
			// Get auth config creation fields using Composio v3 API
			const response = await fetch(`${COMPOSIO_API_BASE}/toolkits/${args.toolkit}/auth_config_fields?authScheme=${args.authScheme}&requiredOnly=${args.requiredOnly || false}`, {
				method: 'GET',
				headers: {
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio auth config fields fetch error:', errorData);
				throw new Error(`Failed to fetch auth config fields: ${response.status}`);
			}

			const data = await response.json();
			return data.fields || [];
		} catch (error) {
			console.error('Error fetching auth config fields:', error);
			throw new Error('Failed to fetch auth config fields');
		}
	},
});

// Enable helper actions for autonomous authentication
export const enableHelperActions = action({
	args: {
		workspaceId: v.id('workspaces'),
		mcpServerId: v.id('mcp_servers'),
	},
	handler: async (ctx, args): Promise<{
		success: boolean;
		urls: any;
		helperActionsEnabled: boolean;
	}> => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error('Unauthorized');

		// Check if user is a member of the workspace
		const member: any = await ctx.runQuery(api.members.current, {
			workspaceId: args.workspaceId,
		});

		if (!member) throw new Error('Unauthorized');

		// Get MCP server
		const mcpServer: any = await ctx.runQuery(api.integrations.getMCPServerById, {
			mcpServerId: args.mcpServerId,
		});
		if (!mcpServer || mcpServer.workspaceId !== args.workspaceId) {
			throw new Error('MCP server not found');
		}

		try {
			// Generate URLs with helper actions enabled
			const response = await fetch(`${COMPOSIO_API_BASE}/mcp/servers/${mcpServer.composioServerId}/urls`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
				body: JSON.stringify({
					userIds: [userId],
					managedAuthByComposio: mcpServer.useComposioManagedAuth,
					includeComposioHelperActions: true, // Enable helper actions
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('Composio helper actions enable error:', errorData);
				throw new Error(`Failed to enable helper actions: ${response.status}`);
			}

			const urlData = await response.json();

			// Update server with helper-enabled URLs
			await ctx.runMutation(api.integrations.updateMCPServerUrls, {
				mcpServerId: args.mcpServerId,
				serverUrls: urlData,
				updatedAt: Date.now(),
			});

			return {
				success: true,
				urls: urlData,
				helperActionsEnabled: true,
			};
		} catch (error) {
			console.error('Error enabling helper actions:', error);
			throw new Error('Failed to enable helper actions');
		}
	},
});
