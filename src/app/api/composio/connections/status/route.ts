import { NextRequest, NextResponse } from 'next/server';

const COMPOSIO_API_BASE = 'https://backend.composio.dev/api/v3';

// Check connection status
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const composioAccountId = searchParams.get('composioAccountId');

		if (!composioAccountId) {
			return NextResponse.json(
				{ error: 'Composio account ID is required' },
				{ status: 400 }
			);
		}

		console.log('[Composio Status] Checking status for account:', composioAccountId);

		// Check connection status using Composio v3 API
		const response = await fetch(`${COMPOSIO_API_BASE}/connected_accounts/${composioAccountId}`, {
			method: 'GET',
			headers: {
				'X-API-Key': process.env.COMPOSIO_API_KEY!,
			},
		});

		if (!response.ok) {
			if (response.status === 404) {
				return NextResponse.json({
					connected: false,
					status: 'NOT_FOUND',
					error: 'Account not found',
				});
			}
			
			const errorData = await response.text();
			console.error('Composio status check error:', errorData);
			return NextResponse.json(
				{ error: `Failed to check status: ${response.status}` },
				{ status: response.status }
			);
		}

		const accountData = await response.json();

		console.log('[Composio Status] Status checked successfully');

		return NextResponse.json({
			connected: accountData.status === 'ACTIVE',
			connectionId: accountData.id,
			status: accountData.status,
			metadata: accountData,
		});
	} catch (error) {
		console.error('[Composio Status] Error:', error);
		return NextResponse.json(
			{ error: 'Failed to check connection status' },
			{ status: 500 }
		);
	}
}
