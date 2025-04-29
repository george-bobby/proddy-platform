import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { messageBodies } = await req.json();

    if (!messageBodies || !Array.isArray(messageBodies) || messageBodies.length === 0) {
      return NextResponse.json({ error: 'Invalid message bodies' }, { status: 400 });
    }

    // For testing purposes, just capitalize all message bodies
    const capitalizedTexts = messageBodies.map((body) => body.toUpperCase());

    // Join the capitalized texts with separators
    const summary = capitalizedTexts.join('\n\n--------\n\n');

    // Return the capitalized text as a summary
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
