import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
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

// Create auth config
export async function POST(req: NextRequest) {
	try {
		const {
			workspaceId,
			toolkit,
			name,
			type = 'use_composio_managed_auth',
			authScheme,
			credentials,
			userId
		} = await req.json();

		if (!workspaceId || !toolkit || !name || !userId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		console.log('[Composio Auth Config] Creating auth config for:', toolkit);

		// Create auth config in Composio v3
		const response = await fetch(`${COMPOSIO_API_BASE}/auth_configs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': process.env.COMPOSIO_API_KEY!,
			},
			body: JSON.stringify({
				toolkit,
				name,
				type,
				authScheme,
				credentials,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Composio auth config creation error:', errorData);
			return NextResponse.json(
				{ error: `Failed to create auth config: ${response.status}` },
				{ status: response.status }
			);
		}

		const composioAuthConfig = await response.json();

		// Store in Convex database
		const authConfigId = await convex.mutation(api.integrations.storeAuthConfig, {
			workspaceId: workspaceId as Id<'workspaces'>,
			toolkit: toolkit as SupportedToolkit,
			name,
			type,
			authScheme,
			composioAuthConfigId: composioAuthConfig.id,
			credentials,
			isComposioManaged: type === 'use_composio_managed_auth' || !type,
			createdBy: userId as Id<'members'>,
		});

		console.log('[Composio Auth Config] Auth config created successfully');

		return NextResponse.json({
			id: authConfigId,
			composioId: composioAuthConfig.id,
			...composioAuthConfig,
		});
	} catch (error) {
		console.error('[Composio Auth Config] Error:', error);
		return NextResponse.json(
			{ error: 'Failed to create auth config' },
			{ status: 500 }
		);
	}
}

// Get auth configs for workspace
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const workspaceId = searchParams.get('workspaceId');

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 }
			);
		}

		console.log('[Composio Auth Config] Fetching configs for workspace:', workspaceId);

		try {
			const authConfigs = await convex.query(api.integrations.getAuthConfigsPublic, {
				workspaceId: workspaceId as Id<'workspaces'>,
			});

			console.log('[Composio Auth Config] Found', authConfigs.length, 'auth configs');
			return NextResponse.json(authConfigs);
		} catch (convexError) {
			console.error('[Composio Auth Config] Convex error:', convexError);

			// If it's an authorization error, return empty array instead of error
			if (convexError instanceof Error && convexError.message === 'Unauthorized') {
				console.log('[Composio Auth Config] User not authorized for workspace, returning empty array');
				return NextResponse.json([]);
			}

			// For other errors, still return empty array to prevent UI breaking
			console.log('[Composio Auth Config] Returning empty array due to error');
			return NextResponse.json([]);
		}
	} catch (error) {
		console.error('[Composio Auth Config] Error fetching configs:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch auth configs' },
			{ status: 500 }
		);
	}
}
