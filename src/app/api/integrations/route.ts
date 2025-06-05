import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
	try {
		const { workspaceId, service } = await req.json();

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 }
			);
		}

		if (!service) {
			return NextResponse.json(
				{ error: 'Service is required' },
				{ status: 400 }
			);
		}

		try {
			// Query the integration for this workspace and service
			const integration = await convex.query(api.integrations.getByWorkspaceAndService, {
				workspaceId,
				service,
			});

			return NextResponse.json(integration);
		} catch (convexError) {
			console.log(`No ${service} integration found for workspace:`, workspaceId);
			// Return null if no integration is connected
			return NextResponse.json(null);
		}
	} catch (error) {
		console.error('Error fetching integration:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch integration' },
			{ status: 500 }
		);
	}
}

// Get all integrations for a workspace
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
			// Query all integrations for this workspace
			const integrations = await convex.query(api.integrations.getByWorkspaceId, {
				workspaceId,
			});

			return NextResponse.json(integrations);
		} catch (convexError) {
			console.log('No integrations found for workspace:', workspaceId);
			// Return empty array if no integrations are connected
			return NextResponse.json([]);
		}
	} catch (error) {
		console.error('Error fetching integrations:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch integrations' },
			{ status: 500 }
		);
	}
}
