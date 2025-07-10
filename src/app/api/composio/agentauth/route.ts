import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Composio with AgentAuth
const initializeComposio = () => {
	// This would be the Composio SDK initialization
	// For now, we'll use direct API calls following AgentAuth pattern
	return {
		apiKey: process.env.COMPOSIO_API_KEY!,
		baseUrl: 'https://backend.composio.dev/api/v1', // AgentAuth uses v1 API
	};
};

// Step 1: Authorize user to a toolkit (AgentAuth pattern)
export async function POST(req: NextRequest) {
	try {
		const { action, userId, toolkit, workspaceId, memberId } = await req.json();

		if (!userId || !toolkit || !workspaceId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const composio = initializeComposio();

		if (action === 'authorize') {
			console.log(`[AgentAuth] Authorizing user ${userId} for ${toolkit}`);

			// Step 1: Authorize the User to a Toolkit using AgentAuth
			const response = await fetch(`${composio.baseUrl}/toolkits/authorize`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': composio.apiKey,
				},
				body: JSON.stringify({
					userId,
					toolkit,
					redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/workspace/${workspaceId}/manage?toolkit=${toolkit}&connected=true&userId=${userId}`,
				}),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('AgentAuth authorization error:', errorData);
				return NextResponse.json(
					{ error: `Failed to authorize: ${response.status}` },
					{ status: response.status }
				);
			}

			const authData = await response.json();

			// Store auth config in database for tracking
			if (memberId) {
				try {
					await convex.mutation(api.integrations.storeAuthConfig, {
						workspaceId: workspaceId as Id<'workspaces'>,
						toolkit: toolkit as any,
						name: `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} AgentAuth`,
						type: 'use_composio_managed_auth',
						composioAuthConfigId: authData.connectionId || `agentauth_${Date.now()}`,
						isComposioManaged: true,
						createdBy: memberId as Id<'members'>,
					});
				} catch (error) {
					console.warn('Failed to store auth config:', error);
				}
			}

			return NextResponse.json({
				success: true,
				redirectUrl: authData.redirectUrl,
				connectionId: authData.connectionId,
				message: `Redirect user to ${toolkit} authorization`,
			});
		}

		if (action === 'complete') {
			console.log(`[AgentAuth] Completing connection for user ${userId} and ${toolkit}`);

			// Step 2: Wait for connection completion and fetch tools
			const connectionResponse = await fetch(`${composio.baseUrl}/connected_accounts?userId=${userId}&toolkit=${toolkit}`, {
				method: 'GET',
				headers: {
					'X-API-Key': composio.apiKey,
				},
			});

			if (!connectionResponse.ok) {
				return NextResponse.json(
					{ error: 'Failed to verify connection' },
					{ status: 400 }
				);
			}

			const connections = await connectionResponse.json();
			const connectedAccount = connections.items?.[0];

			if (!connectedAccount) {
				return NextResponse.json(
					{ error: 'No connected account found' },
					{ status: 404 }
				);
			}

			// Store connected account in database
			if (memberId) {
				try {
					// Create auth config first
					const authConfigId = await convex.mutation(api.integrations.storeAuthConfig, {
						workspaceId: workspaceId as Id<'workspaces'>,
						toolkit: toolkit as any,
						name: `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} AgentAuth`,
						type: 'use_composio_managed_auth',
						composioAuthConfigId: connectedAccount.id,
						isComposioManaged: true,
						createdBy: memberId as Id<'members'>,
					});

					// Store connected account
					await convex.mutation(api.integrations.storeConnectedAccount, {
						workspaceId: workspaceId as Id<'workspaces'>,
						authConfigId: authConfigId,
						userId,
						composioAccountId: connectedAccount.id,
						toolkit,
						status: 'ACTIVE',
						metadata: connectedAccount,
						connectedBy: memberId as Id<'members'>,
					});
				} catch (error) {
					console.warn('Failed to store connected account:', error);
				}
			}

			return NextResponse.json({
				success: true,
				connectedAccount,
				message: `${toolkit} connected successfully`,
			});
		}

		return NextResponse.json(
			{ error: 'Invalid action' },
			{ status: 400 }
		);
	} catch (error) {
		console.error('[AgentAuth] Error:', error);
		return NextResponse.json(
			{ error: 'AgentAuth operation failed' },
			{ status: 500 }
		);
	}
}

// Get tools for connected toolkit (Step 2 of AgentAuth)
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get('userId');
		const toolkit = searchParams.get('toolkit');

		if (!userId || !toolkit) {
			return NextResponse.json(
				{ error: 'Missing userId or toolkit' },
				{ status: 400 }
			);
		}

		const composio = initializeComposio();

		console.log(`[AgentAuth] Fetching tools for user ${userId} and toolkit ${toolkit}`);

		// Step 2: Fetch Prebuilt Tools for the Connected Toolkit
		const toolsResponse = await fetch(`${composio.baseUrl}/tools?userId=${userId}&toolkits=${toolkit}`, {
			method: 'GET',
			headers: {
				'X-API-Key': composio.apiKey,
			},
		});

		if (!toolsResponse.ok) {
			const errorData = await toolsResponse.text();
			console.error('AgentAuth tools fetch error:', errorData);
			return NextResponse.json(
				{ error: `Failed to fetch tools: ${toolsResponse.status}` },
				{ status: toolsResponse.status }
			);
		}

		const tools = await toolsResponse.json();

		return NextResponse.json({
			success: true,
			tools: tools.items || tools,
			toolkit,
			userId,
		});
	} catch (error) {
		console.error('[AgentAuth] Error fetching tools:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch tools' },
			{ status: 500 }
		);
	}
}
