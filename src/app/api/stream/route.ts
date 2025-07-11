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
      apiSecretExists: !!apiSecret,
      apiKeyLength: apiKey?.length || 0,
      apiSecretLength: apiSecret?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 4) || 'none',
      environment: process.env.NODE_ENV
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
          apiSecretExists: !!apiSecret,
          environment: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    // Validate API key format (Stream API keys are typically 12 characters)
    if (apiKey.length !== 12) {
      console.warn('Stream API key length is unexpected:', apiKey.length);
    }

    // Initialize Stream client
    const streamClient = new StreamClient(apiKey, apiSecret);

    // Generate a token for Stream authentication using the official SDK
    const token = streamClient.generateUserToken({ user_id: userId });
    console.log('Token generated successfully using Stream SDK');

    // Return additional debug info in development
    const response: any = { token };
    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        apiKeyPrefix: apiKey.substring(0, 4),
        apiKeyLength: apiKey.length,
        tokenLength: token.length
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : String(error),
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}

// Add a GET endpoint for debugging credentials (development only)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  return NextResponse.json({
    apiKeyExists: !!apiKey,
    apiSecretExists: !!apiSecret,
    apiKeyLength: apiKey?.length || 0,
    apiSecretLength: apiSecret?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 4) || 'none',
    environment: process.env.NODE_ENV
  });
}