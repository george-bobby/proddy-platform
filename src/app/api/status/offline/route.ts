import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
	try {
		const { workspaceId } = await req.json();

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 }
			);
		}

		// Update user status to offline
		await convex.mutation(api.status.update, {
			status: 'offline',
			workspaceId,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating offline status:', error);
		return NextResponse.json(
			{ error: 'Failed to update status' },
			{ status: 500 }
		);
	}
}
