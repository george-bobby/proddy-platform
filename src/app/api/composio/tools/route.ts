import { NextRequest, NextResponse } from "next/server";
import { Composio } from "@composio/core";
import { OpenAIProvider } from "@composio/openai";
import OpenAI from "openai";

// Initialize Composio SDK with OpenAI provider
const initializeComposio = () => {
  if (!process.env.COMPOSIO_API_KEY) {
    throw new Error("COMPOSIO_API_KEY environment variable is required");
  }

  return new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
    provider: new OpenAIProvider(),
  });
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * HTTP POST handler that discovers Composio tools for an entity, invokes OpenAI with those tools, optionally executes tool calls via Composio, and returns the composed response.
 *
 * Accepts a JSON body with `entityId` (string), `appNames` (string[]), and `message` (string). Workflow:
 * - Retrieves tools for the specified entity and apps via Composio.
 * - Converts tools into OpenAI function/tool format and sends a chat completion to OpenAI.
 * - If the model issues tool calls, executes them through Composio and collects results.
 * - If tool results are produced, sends a follow-up completion including those results and returns the final assistant response.
 *
 * @returns A JSON NextResponse with shape:
 * {
 *   success: true,
 *   response: string,                 // final assistant text
 *   toolCalls: Array,                 // tool call objects returned by the model (if any)
 *   toolResults: Array,               // results or errors from executing tools
 *   availableTools: number            // count of discovered tools
 * }
 *
 * Responds with status 400 when `entityId`, `appNames`, or `message` are missing, and 500 on internal errors.
 */
export async function POST(req: NextRequest) {
  try {
    const { entityId, appNames, message } = await req.json();

    if (!entityId || !appNames || !message) {
      return NextResponse.json(
        { error: "entityId, appNames, and message are required" },
        { status: 400 },
      );
    }

    console.log("[Composio Tools] Getting tools for:", { entityId, appNames });

    const composio = initializeComposio();

    // Get tools for the specified apps using the Composio SDK
    let tools: any[] = [];
    try {
      // Get all available tools for the entity with specific apps
      for (const appName of appNames) {
        try {
          const appTools = await composio.tools.get(entityId, appName);
          if (Array.isArray(appTools)) {
            tools.push(...appTools);
          } else if (appTools) {
            tools.push(appTools);
          }
        } catch (error) {
          console.warn(`No tools found for app ${appName}:`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
      tools = [];
    }

    console.log("[Composio Tools] Retrieved", tools.length, "tools");

    // Convert Composio tools to OpenAI format
    const openaiTools = tools.map((tool: any) => ({
      type: "function" as const,
      function: {
        name: tool.name || tool.slug,
        description: tool.description,
        parameters: tool.parameters || tool.schema || {},
      },
    }));

    // Use the tools with OpenAI directly
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant with access to ${appNames.join(", ")} tools. Help the user accomplish their tasks using these tools.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    let responseText =
      completion.choices[0]?.message?.content || "No response generated";
    let toolResults: any[] = [];

    // Execute any tool calls with Composio
    if (
      completion.choices[0]?.message?.tool_calls &&
      completion.choices[0].message.tool_calls.length > 0
    ) {
      console.log(
        "[Composio Tools] Executing",
        completion.choices[0].message.tool_calls.length,
        "tool calls",
      );

      for (const toolCall of completion.choices[0].message.tool_calls) {
        if (toolCall.type === "function") {
          try {
            const result = await composio.tools.execute(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments),
            );

            toolResults.push({
              toolCallId: toolCall.id,
              result: result,
              toolName: toolCall.function.name,
            });
          } catch (error) {
            console.error("Tool execution error:", error);
            toolResults.push({
              toolCallId: toolCall.id,
              error: error instanceof Error ? error.message : "Unknown error",
              toolName: toolCall.function.name,
            });
          }
        }
      }

      // If we have tool results, create a follow-up completion
      if (toolResults.length > 0) {
        const followUpMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: `You are a helpful assistant with access to ${appNames.join(", ")} tools. Help the user accomplish their tasks using these tools.`,
          },
          {
            role: "user",
            content: message,
          },
          completion.choices[0].message,
          ...toolResults.map((result) => ({
            role: "tool" as const,
            tool_call_id: result.toolCallId,
            content: result.error
              ? `Error: ${result.error}`
              : JSON.stringify(result.result),
          })),
        ];

        const followUpCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: followUpMessages,
          temperature: 0.7,
          max_tokens: 1000,
        });

        responseText =
          followUpCompletion.choices[0]?.message?.content || responseText;
      }
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      toolCalls: completion.choices[0]?.message?.tool_calls || [],
      toolResults,
      availableTools: tools.length,
    });
  } catch (error) {
    console.error("[Composio Tools] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * HTTP GET handler that returns Composio tools available to an entity.
 *
 * Accepts query parameters:
 * - `entityId` (required): the target entity identifier.
 * - `appNames` (optional): comma-separated list of app names to limit the results.
 *
 * Behavior:
 * - Validates `entityId`; responds with 400 if missing.
 * - If `appNames` provided, fetches tools per app and aggregates results; otherwise fetches all tools for the entity.
 * - Normalizes each tool to an object with `name`, `description`, `parameters`, and `appName`.
 *
 * Successful response (status 200) JSON shape:
 * {
 *   success: true,
 *   tools: Array<{ name: string; description?: string; parameters: any; appName?: string }>,
 *   count: number
 * }
 *
 * Error responses:
 * - 400 when `entityId` is missing.
 * - 500 on internal errors with `{ success: false, error: string }`.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    const appNames = searchParams.get("appNames")?.split(",") || [];

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId is required" },
        { status: 400 },
      );
    }

    console.log("[Composio Tools] Getting available tools for:", {
      entityId,
      appNames,
    });

    const composio = initializeComposio();

    // Get tools for the specified apps
    let tools: any[] = [];

    if (appNames.length > 0) {
      // Get tools for specific apps
      for (const appName of appNames) {
        try {
          const appTools = await composio.tools.get(entityId, appName);
          if (Array.isArray(appTools)) {
            tools.push(...appTools);
          } else if (appTools) {
            tools.push(appTools);
          }
        } catch (error) {
          console.warn(`No tools found for app ${appName}:`, error);
        }
      }
    } else {
      // Get all available tools for the entity
      try {
        const allTools = await composio.tools.get(entityId, {} as any);
        tools = Array.isArray(allTools) ? allTools : [allTools];
      } catch (error) {
        console.warn("No tools found for entity:", error);
        tools = [];
      }
    }

    return NextResponse.json({
      success: true,
      tools: tools.map((tool: any) => ({
        name: tool.name || tool.slug,
        description: tool.description,
        parameters: tool.parameters || tool.schema || {},
        appName: tool.appName || tool.app_name,
      })),
      count: tools.length,
    });
  } catch (error) {
    console.error("[Composio Tools] GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
