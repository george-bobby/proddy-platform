import { NextRequest, NextResponse } from "next/server";

/**
 * Forwards incoming POST requests to the internal chatbot endpoint and returns its JSON response.
 *
 * The incoming request body is read as JSON and proxied to `${req.nextUrl.origin}/api/assistant/chatbot`
 * using a POST with `Content-Type: application/json`. The handler returns the chatbot endpoint's parsed JSON
 * and preserves its HTTP status. If an unexpected error occurs, responds with status 500 and a JSON payload:
 * `{ error: "Failed to process request", details: string }`.
 *
 * @returns A NextResponse containing the chatbot endpoint's JSON result with the same status code,
 * or an error payload with HTTP status 500 if forwarding fails.
 */
export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();

    // Forward the request to the chatbot endpoint
    const chatbotResponse = await fetch(
      `${req.nextUrl.origin}/api/assistant/chatbot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    // Return the response from the chatbot endpoint
    const result = await chatbotResponse.json();
    return NextResponse.json(result, { status: chatbotResponse.status });
  } catch (error) {
    console.error("[Assistant Router] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
