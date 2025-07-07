import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
	try {
		const { sessionToken } = await req.json();

		if (!sessionToken) {
			return NextResponse.json(
				{ error: 'Session token is required' },
				{ status: 400 }
			);
		}

		// Disconnect from presence system
		await convex.mutation(api.presence.disconnect, {
			sessionToken,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error disconnecting from presence:', error);
		return NextResponse.json(
			{ error: 'Failed to disconnect' },
			{ status: 500 }
		);
	}
}
