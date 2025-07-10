import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Get auth config by toolkit
export async function POST(req: NextRequest) {
	try {
		const { workspaceId, toolkit } = await req.json();

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 }
			);
		}

		if (!toolkit) {
			return NextResponse.json(
				{ error: 'Toolkit is required' },
				{ status: 400 }
			);
		}

		try {
			// Query the auth config for this workspace and toolkit
			const authConfig = await convex.query(
				api.integrations.getAuthConfigByToolkit,
				{
					workspaceId: workspaceId as Id<'workspaces'>,
					toolkit,
				}
			);

			return NextResponse.json(authConfig);
		} catch (convexError) {
			console.log(
				`No ${toolkit} auth config found for workspace:`,
				workspaceId
			);
			// Return null if no auth config exists
			return NextResponse.json(null);
		}
	} catch (error) {
		console.error('Error fetching auth config:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch auth config' },
			{ status: 500 }
		);
	}
}

// Get all auth configs and connected accounts for a workspace
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

		try {
			// Query all auth configs for this workspace
			const authConfigs = await convex.query(
				api.integrations.getAuthConfigs,
				{
					workspaceId: workspaceId as Id<'workspaces'>,
				}
			);

			// Query all connected accounts for this workspace
			const connectedAccounts = await convex.query(
				api.integrations.getConnectedAccounts,
				{
					workspaceId: workspaceId as Id<'workspaces'>,
				}
			);

			return NextResponse.json({
				authConfigs,
				connectedAccounts,
			});
		} catch (convexError) {
			console.log('No auth configs found for workspace:', workspaceId);
			// Return empty arrays if no configs exist
			return NextResponse.json({
				authConfigs: [],
				connectedAccounts: [],
			});
		}
	} catch (error) {
		console.error('Error fetching auth configs:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch auth configs' },
			{ status: 500 }
		);
	}
}
