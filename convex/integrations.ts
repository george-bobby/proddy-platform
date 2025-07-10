import {getAuthUserId} from '@convex-dev/auth/server';
import {v} from 'convex/values';

import type {Id} from './_generated/dataModel';
import {mutation, query} from './_generated/server';

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

// ===== HELPER FUNCTIONS =====

async function getCurrentMember(ctx: any, workspaceId: Id<'workspaces'>) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    const member = await ctx.db
        .query('members')
        .withIndex('by_workspace_id_user_id', (q: any) =>
            q.eq('workspaceId', workspaceId).eq('userId', userId)
        )
        .first();

    if (!member) throw new Error('Unauthorized');
    return member;
}

// ===== AUTH CONFIGS =====

// Get all auth configs for a workspace
export const getAuthConfigs = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        await getCurrentMember(ctx, args.workspaceId);

        const authConfigs = await ctx.db
            .query('auth_configs')
            .withIndex('by_workspace_id', (q) =>
                q.eq('workspaceId', args.workspaceId)
            )
            .collect();

        return authConfigs;
    },
});

// Get all auth configs for a workspace (public version for API routes)
export const getAuthConfigsPublic = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        // Skip authentication check for API routes
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
        await getCurrentMember(ctx, args.workspaceId);

        const authConfig = await ctx.db
            .query('auth_configs')
            .withIndex('by_workspace_toolkit', (q) =>
                q.eq('workspaceId', args.workspaceId).eq('toolkit', args.toolkit)
            )
            .first();

        return authConfig;
    },
});

// Get auth config by ID
export const getAuthConfigById = query({
    args: {
        authConfigId: v.id('auth_configs'),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.authConfigId);
    },
});

// Store auth config in database
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

// ===== CONNECTED ACCOUNTS =====

// Get all connected accounts for a workspace
export const getConnectedAccounts = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        await getCurrentMember(ctx, args.workspaceId);

        const connectedAccounts = await ctx.db
            .query('connected_accounts')
            .withIndex('by_workspace_id', (q) =>
                q.eq('workspaceId', args.workspaceId)
            )
            .collect();

        return connectedAccounts;
    },
});

// Get all connected accounts for a workspace (public version for API routes)
export const getConnectedAccountsPublic = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        // Skip authentication check for API routes
        const connectedAccounts = await ctx.db
            .query('connected_accounts')
            .withIndex('by_workspace_id', (q) =>
                q.eq('workspaceId', args.workspaceId)
            )
            .collect();

        return connectedAccounts;
    },
});

// Get connected account by user and toolkit
export const getConnectedAccountByUserAndToolkit = query({
    args: {
        workspaceId: v.id('workspaces'),
        userId: v.string(),
        toolkit: v.string(),
    },
    handler: async (ctx, args) => {
        await getCurrentMember(ctx, args.workspaceId);

        return await ctx.db
            .query('connected_accounts')
            .withIndex('by_workspace_id', (q) =>
                q.eq('workspaceId', args.workspaceId)
            )
            .filter((q) =>
                q.and(
                    q.eq(q.field('userId'), args.userId),
                    q.eq(q.field('toolkit'), args.toolkit)
                )
            )
            .first();
    },
});

// Store connected account in database
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

// Update connected account status
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

// ===== MCP SERVERS =====

// Get MCP servers for workspace
export const getMCPServers = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        await getCurrentMember(ctx, args.workspaceId);

        const mcpServers = await ctx.db
            .query('mcp_servers')
            .withIndex('by_workspace_id', (q) =>
                q.eq('workspaceId', args.workspaceId)
            )
            .collect();

        return mcpServers;
    },
});

// Get MCP servers for workspace (public version for API routes)
export const getMCPServersPublic = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        // Skip authentication check for API routes
        const mcpServers = await ctx.db
            .query('mcp_servers')
            .withIndex('by_workspace_id', (q) =>
                q.eq('workspaceId', args.workspaceId)
            )
            .collect();

        return mcpServers;
    },
});

// Store MCP server in database
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
