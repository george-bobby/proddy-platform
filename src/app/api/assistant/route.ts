import { NextRequest, NextResponse } from "next/server";

// Redirect to the chatbot endpoint
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
      }
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
      { status: 500 }
    );
  }
}
