import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3';

// Initiate connection
export async function POST(req: NextRequest) {
	try {
		const {
			workspaceId,
			authConfigId,
			userId,
			callbackUrl
		} = await req.json();

		if (!workspaceId || !authConfigId || !userId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		console.log('[Composio Connection] Initiating connection for auth config:', authConfigId);

		// Get auth config from database
		const authConfig = await convex.query(api.integrations.getAuthConfigById, {
			authConfigId: authConfigId as Id<'auth_configs'>,
		});

		if (!authConfig) {
			return NextResponse.json(
				{ error: 'Auth config not found' },
				{ status: 404 }
			);
		}

		// Initiate connection using Composio v3 API
		const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': process.env.COMPOSIO_API_KEY!,
			},
			body: JSON.stringify({
				userId,
				authConfigId: authConfig.composioAuthConfigId,
				callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspaceId}/integrations/callback`,
			}),
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Composio connection initiation error:', errorData);
			return NextResponse.json(
				{ error: `Failed to initiate connection: ${response.status}` },
				{ status: response.status }
			);
		}

		const connectionData = await response.json();

		console.log('[Composio Connection] Connection initiated successfully');

		return NextResponse.json({
			redirectUrl: connectionData.redirectUrl,
			connectionId: connectionData.id,
			...connectionData,
		});
	} catch (error) {
		console.error('[Composio Connection] Error:', error);
		return NextResponse.json(
			{ error: 'Failed to initiate connection' },
			{ status: 500 }
		);
	}
}

// Get connected accounts for workspace
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

		console.log('[Composio Connection] Fetching accounts for workspace:', workspaceId);

		try {
			const connectedAccounts = await convex.query(api.integrations.getConnectedAccountsPublic, {
				workspaceId: workspaceId as Id<'workspaces'>,
			});

			console.log('[Composio Connection] Found', connectedAccounts.length, 'connected accounts');
			return NextResponse.json(connectedAccounts);
		} catch (convexError) {
			console.error('[Composio Connection] Convex error:', convexError);

			// If it's an authorization error, return empty array instead of error
			if (convexError instanceof Error && convexError.message === 'Unauthorized') {
				console.log('[Composio Connection] User not authorized for workspace, returning empty array');
				return NextResponse.json([]);
			}

			// For other errors, still return empty array to prevent UI breaking
			console.log('[Composio Connection] Returning empty array due to error');
			return NextResponse.json([]);
		}
	} catch (error) {
		console.error('[Composio Connection] Error fetching accounts:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch connected accounts' },
			{ status: 500 }
		);
	}
}
