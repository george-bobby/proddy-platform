import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3';

// Disconnect account
export async function DELETE(req: NextRequest) {
	try {
		const {
			workspaceId,
			connectedAccountId,
			composioAccountId,
		} = await req.json();

		if (!workspaceId || !connectedAccountId || !composioAccountId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		console.log('[Composio Disconnect] Disconnecting account:', composioAccountId);

		// First, disconnect from Composio
		try {
			const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts/${composioAccountId}`, {
				method: 'DELETE',
				headers: {
					'X-API-Key': process.env.COMPOSIO_API_KEY!,
				},
			});

			if (!response.ok) {
				console.warn('Failed to disconnect from Composio, but continuing with local cleanup');
			}
		} catch (error) {
			console.warn('Error disconnecting from Composio:', error);
		}

		// Update the connected account status in database
		await convex.mutation(api.integrations.updateConnectedAccountStatus, {
			connectedAccountId: connectedAccountId as Id<'connected_accounts'>,
			status: 'DISABLED',
			isDisabled: true,
		});

		console.log('[Composio Disconnect] Account disconnected successfully');

		return NextResponse.json({
			success: true,
			message: 'Account disconnected successfully',
		});
	} catch (error) {
		console.error('[Composio Disconnect] Error:', error);
		return NextResponse.json(
			{ error: 'Failed to disconnect account' },
			{ status: 500 }
		);
	}
}
