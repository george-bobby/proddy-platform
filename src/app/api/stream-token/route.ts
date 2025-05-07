import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

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

    // Generate a token for Stream authentication
    const token = createDemoToken(userId);
    console.log('Token generated successfully');

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({
      error: 'Failed to generate token',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Create a token for Stream API authentication
function createDemoToken(userId: string) {
  if (!apiSecret) {
    throw new Error('STREAM_API_SECRET environment variable is not set');
  }

  // Create a JWT token with the necessary claims
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Current timestamp in seconds
  const currentTime = Math.floor(Date.now() / 1000);

  // Token valid for 24 hours
  const expiryTime = currentTime + 86400;

  // Create payload according to Stream's requirements
  const payload = {
    user_id: userId,
    exp: expiryTime,
    iat: currentTime
  };

  console.log('Creating token for user:', userId);
  console.log('Using API key:', apiKey);
  console.log('Using API secret:', apiSecret?.substring(0, 5) + '...');

  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  // Create signature using HMAC SHA256
  const crypto = require('crypto');
  const signature = crypto.createHmac('sha256', apiSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  console.log('Generated token:', token.substring(0, 20) + '...');

  // Return the complete JWT token
  return token;
}
