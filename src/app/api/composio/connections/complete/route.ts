import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3';

// Complete connection after OAuth callback
export async function POST(req: NextRequest) {
	try {
		const {
			workspaceId,
			authConfigId,
			userId,
			connectionData,
			memberId
		} = await req.json();

		if (!workspaceId || !authConfigId || !userId || !memberId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		console.log('[Composio Complete] Completing connection for auth config:', authConfigId);

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

		// Check if connection already exists
		const existingAccount = await convex.query(api.integrations.getConnectedAccountByUserAndToolkit, {
			workspaceId: workspaceId as Id<'workspaces'>,
			userId,
			toolkit: authConfig.toolkit,
		});

		if (existingAccount) {
			console.log('[Composio Complete] Connection already exists');
			return NextResponse.json({
				success: true,
				message: 'Connection already exists',
				account: existingAccount,
			});
		}

		// Get connection details from Composio
		let composioAccountId = connectionData?.id;
		
		if (!composioAccountId) {
			// If no connection ID provided, try to find it by checking recent connections
			const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts?userId=${userId}&authConfigId=${authConfig.composioAuthConfigId}`, {
				method: 'GET',
				headers: {
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
			});

			if (response.ok) {
				const accounts = await response.json();
				const recentAccount = accounts.items?.[0];
				if (recentAccount) {
					composioAccountId = recentAccount.id;
				}
			}
		}

		if (!composioAccountId) {
			return NextResponse.json(
				{ error: 'Connection ID not found' },
				{ status: 400 }
			);
		}

		// Store connected account in database
		const connectedAccountId = await convex.mutation(api.integrations.storeConnectedAccount, {
			workspaceId: workspaceId as Id<'workspaces'>,
			authConfigId: authConfigId as Id<'auth_configs'>,
			userId,
			composioAccountId,
			toolkit: authConfig.toolkit,
			status: 'ACTIVE',
			connectedBy: memberId as Id<'members'>,
		});

		console.log('[Composio Complete] Connection completed successfully');

		return NextResponse.json({
			success: true,
			accountId: connectedAccountId,
			composioAccountId,
		});
	} catch (error) {
		console.error('[Composio Complete] Error:', error);
		return NextResponse.json(
			{ error: 'Failed to complete connection' },
			{ status: 500 }
		);
	}
}
