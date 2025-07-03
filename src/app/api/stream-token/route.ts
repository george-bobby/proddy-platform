import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';

// Stream API credentials from environment variables
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Get the user ID from the request
    const { userId, userName, userImage } = await req.json();

    console.log('Stream token request received for user:', { userId, userName });
    console.log('Environment variables check:', {
      apiKeyExists: !!apiKey,
      apiSecretExists: !!apiSecret
    });

    if (!userId) {
      console.error('User ID is missing in the request');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!apiKey || !apiSecret) {
      console.error('Stream API credentials are missing');
      return NextResponse.json({
        error: 'Stream API credentials are not configured properly',
        details: {
          apiKeyExists: !!apiKey,
          apiSecretExists: !!apiSecret
        }
      }, { status: 500 });
    }

    // Initialize Stream client
    const streamClient = new StreamClient(apiKey, apiSecret);

    // Generate a token for Stream authentication using the official SDK
    const token = streamClient.generateUserToken({ user_id: userId });
    console.log('Token generated successfully using Stream SDK');

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}