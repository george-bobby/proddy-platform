import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Composio SDK-style client
const initializeComposio = () => {
	// Validate environment variables
	if (!process.env.COMPOSIO_API_KEY) {
		throw new Error('COMPOSIO_API_KEY environment variable is required');
	}

	return {
		apiKey: process.env.COMPOSIO_API_KEY,
		baseUrl: 'https://backend.composio.dev/api/v3',
		// SDK-style methods
		toolkits: {
			authorize: async (userId: string, toolkit: string) => {
				const response = await fetch(
					'https://backend.composio.dev/api/v3/toolkits/authorize',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-API-Key': process.env.COMPOSIO_API_KEY!,
						},
						body: JSON.stringify({ userId, toolkit }),
					}
				);

				if (!response.ok) {
					throw new Error(`Authorization failed: ${response.status}`);
				}

				return await response.json();
			},
		},
		tools: {
			get: async (userId: string, options: { toolkits: string[] }) => {
				const response = await fetch(
					`https://backend.composio.dev/api/v3/tools?userId=${userId}&toolkits=${options.toolkits.join(',')}`,
					{
						method: 'GET',
						headers: {
							'X-API-Key': process.env.COMPOSIO_API_KEY!,
						},
					}
				);

				if (!response.ok) {
					throw new Error(`Tools fetch failed: ${response.status}`);
				}

				return await response.json();
			},
		},
	};
};

// Validate composioAuthConfigId format
const validateAuthConfigFormat = (composioAuthConfigId: string): boolean => {
	// Accept any valid UUID or identifier format from Composio v3 API
	return Boolean(composioAuthConfigId && composioAuthConfigId.length > 0);
};

// Unified POST endpoint for authorization and completion using v3 API
export async function POST(req: NextRequest) {
	try {
		console.log('[Composio] POST request received');
		const body = await req.json();
		console.log('[Composio] Request body:', body);

		const { action, userId, toolkit, workspaceId, memberId } = body;

		if (!userId || !toolkit || !workspaceId) {
			console.log('[Composio] Missing required fields:', {
				userId,
				toolkit,
				workspaceId,
			});
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const composio = initializeComposio();

		if (action === 'authorize') {
			console.log(`[Composio] Authorizing user ${userId} for ${toolkit}`);

			try {
				// Step 1: Authorize the User to a Toolkit (following SDK pattern)
				const connectionRequest = await composio.toolkits.authorize(
					userId,
					toolkit
				);

				// The SDK returns a redirectUrl for OAuth
				const redirectUrl =
					connectionRequest.redirectUrl || connectionRequest.authUrl;

				if (!redirectUrl) {
					console.error('No redirect URL received from Composio');
					return NextResponse.json(
						{ error: 'No redirect URL received from authorization' },
						{ status: 400 }
					);
				}

				// Store auth config in database for tracking
				if (memberId) {
					try {
						// Store the auth config with Composio SDK format
						await convex.mutation(api.integrations.storeAuthConfig, {
							workspaceId: workspaceId as Id<'workspaces'>,
							toolkit: toolkit as any,
							name: `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} Config`,
							type: 'use_composio_managed_auth',
							composioAuthConfigId:
								connectionRequest.connectionId ||
								`composio_${toolkit}_${Date.now()}`,
							isComposioManaged: true,
							createdBy: memberId as Id<'members'>,
						});

						console.log(`[Composio] Auth config stored for ${toolkit}`);
					} catch (error) {
						console.warn('Failed to store auth config:', error);
					}
				}

				return NextResponse.json({
					success: true,
					redirectUrl,
					connectionId: connectionRequest.connectionId,
					message: `Redirect user to ${toolkit} authorization`,
				});
			} catch (error) {
				console.error('Authorization error:', error);
				return NextResponse.json(
					{
						error: `Failed to authorize toolkit: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
					{ status: 400 }
				);
			}
		}

		if (action === 'complete') {
			console.log(
				`[Composio] Completing connection for user ${userId} and ${toolkit}`
			);

			try {
				// Step 2: Fetch connected accounts to verify connection
				const connectionResponse = await fetch(
					`${composio.baseUrl}/connected_accounts?userId=${userId}`,
					{
						method: 'GET',
						headers: {
							'X-API-Key': composio.apiKey,
						},
					}
				);

				if (!connectionResponse.ok) {
					return NextResponse.json(
						{ error: 'Failed to verify connection' },
						{ status: 400 }
					);
				}

				const connections = await connectionResponse.json();
				// Find the most recent connection for this toolkit
				const connectedAccount = connections.items?.find(
					(account: any) =>
						account.toolkit === toolkit ||
						account.authConfig?.toolkit === toolkit
				);

				if (!connectedAccount) {
					return NextResponse.json(
						{ error: 'No connected account found' },
						{ status: 404 }
					);
				}

				// Store connected account in database
				if (memberId) {
					try {
						// Get or create auth config for this toolkit
						let authConfigId;
						try {
							const existingAuthConfig = await convex.query(
								api.integrations.getAuthConfigByToolkit,
								{
									workspaceId: workspaceId as Id<'workspaces'>,
									toolkit: toolkit as any,
								}
							);
							authConfigId = existingAuthConfig?._id;
						} catch (error) {
							// Auth config doesn't exist, create it
						}

						if (!authConfigId) {
							authConfigId = await convex.mutation(
								api.integrations.storeAuthConfig,
								{
									workspaceId: workspaceId as Id<'workspaces'>,
									toolkit: toolkit as any,
									name: `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} Config`,
									type: 'use_composio_managed_auth',
									composioAuthConfigId:
										connectedAccount.authConfigId || connectedAccount.id,
									isComposioManaged: true,
									createdBy: memberId as Id<'members'>,
								}
							);
						}

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

						console.log(`[AgentAuth] Connected account stored for ${toolkit}`);
					} catch (error) {
						console.warn('Failed to store connected account:', error);
					}
				}

				return NextResponse.json({
					success: true,
					connectedAccount,
					message: `${toolkit} connected successfully`,
				});
			} catch (error) {
				console.error('Complete connection error:', error);
				return NextResponse.json(
					{
						error: `Failed to complete connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.error('[AgentAuth] Error:', error);
		return NextResponse.json(
			{ error: 'AgentAuth operation failed' },
			{ status: 500 }
		);
	}
}

// Get auth configs, connected accounts, tools, or check status (unified GET endpoint)
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const action = searchParams.get('action');
		const workspaceId = searchParams.get('workspaceId');
		const userId = searchParams.get('userId');
		const toolkit = searchParams.get('toolkit');
		const composioAccountId = searchParams.get('composioAccountId');

		const composio = initializeComposio();

		// Fetch auth configs and connected accounts for workspace
		if (action === 'fetch-data' && workspaceId) {
			console.log(
				`[AgentAuth] Fetching integration data for workspace: ${workspaceId}`
			);

			try {
				// Fetch auth configs from database
				const authConfigs = await convex.query(
					api.integrations.getAuthConfigsPublic,
					{
						workspaceId: workspaceId as Id<'workspaces'>,
					}
				);

				// Fetch connected accounts from database
				const connectedAccounts = await convex.query(
					api.integrations.getConnectedAccountsPublic,
					{
						workspaceId: workspaceId as Id<'workspaces'>,
					}
				);

				console.log(
					`[AgentAuth] Found ${authConfigs.length} auth configs and ${connectedAccounts.length} connected accounts`
				);

				return NextResponse.json({
					success: true,
					authConfigs,
					connectedAccounts,
				});
			} catch (convexError) {
				console.error('[AgentAuth] Convex error:', convexError);
				// Return empty arrays if there's an error
				return NextResponse.json({
					success: true,
					authConfigs: [],
					connectedAccounts: [],
				});
			}
		}

		// Check connection status
		if (action === 'check-status' && composioAccountId) {
			console.log(
				`[AgentAuth] Checking status for account: ${composioAccountId}`
			);

			const response = await fetch(
				`${composio.baseUrl}/connected_accounts/${composioAccountId}`,
				{
					method: 'GET',
					headers: {
						'X-API-Key': composio.apiKey,
					},
				}
			);

			if (!response.ok) {
				if (response.status === 404) {
					return NextResponse.json({
						connected: false,
						status: 'NOT_FOUND',
						error: 'Account not found',
					});
				}

				const errorData = await response.text();
				console.error('AgentAuth status check error:', errorData);
				return NextResponse.json(
					{ error: `Failed to check status: ${response.status}` },
					{ status: response.status }
				);
			}

			const accountData = await response.json();

			return NextResponse.json({
				connected: accountData.status === 'ACTIVE',
				connectionId: accountData.id,
				status: accountData.status,
				metadata: accountData,
			});
		}

		// Fetch tools for connected toolkit (Step 2 from documentation)
		if (action === 'fetch-tools' && userId && toolkit) {
			console.log(
				`[Composio] Fetching tools for user ${userId} and toolkit ${toolkit}`
			);

			try {
				// Use SDK-style tools.get method
				const tools = await composio.tools.get(userId, { toolkits: [toolkit] });

				return NextResponse.json({
					success: true,
					tools: tools.items || tools,
					toolkit,
					userId,
				});
			} catch (error) {
				console.error('Tools fetch error:', error);
				return NextResponse.json(
					{
						error: `Failed to fetch tools: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
					{ status: 500 }
				);
			}
		}

		// Default response for testing
		return NextResponse.json(
			{
				error: 'Invalid action or missing required parameters',
				receivedAction: action,
			},
			{ status: 400 }
		);
	} catch (error) {
		console.error('[AgentAuth] GET Error:', error);
		return NextResponse.json(
			{ error: 'AgentAuth GET operation failed' },
			{ status: 500 }
		);
	}
}

// Disconnect account (unified DELETE endpoint)
export async function DELETE(req: NextRequest) {
	try {
		const { workspaceId, connectedAccountId, composioAccountId } =
			await req.json();

		if (!workspaceId || !connectedAccountId || !composioAccountId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		console.log(`[AgentAuth] Disconnecting account: ${composioAccountId}`);

		const composio = initializeComposio();

		// First, disconnect from Composio using AgentAuth v1 API
		try {
			const response = await fetch(
				`${composio.baseUrl}/connected_accounts/${composioAccountId}`,
				{
					method: 'DELETE',
					headers: {
						'X-API-Key': composio.apiKey,
					},
				}
			);

			if (!response.ok) {
				console.warn(
					'Failed to disconnect from Composio, but continuing with local cleanup'
				);
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

		console.log(`[AgentAuth] Account disconnected successfully`);

		return NextResponse.json({
			success: true,
			message: 'Account disconnected successfully',
		});
	} catch (error) {
		console.error('[AgentAuth] DELETE Error:', error);
		return NextResponse.json(
			{ error: 'Failed to disconnect account' },
			{ status: 500 }
		);
	}
}
