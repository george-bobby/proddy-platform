import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import {
  createComposioClient,
  getAllToolsForApps,
  filterToolsForQuery,
  getConnectedApps,
  getAnyConnectedApps,
  AVAILABLE_APPS,
  APP_CONFIGS,
  type AvailableApp,
} from "@/lib/composio-config";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache for common queries (expires every 5 minutes)
const queryCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Extract relevant keywords from user query for smart tool selection
function extractKeywords(query: string): string[] {
  const keywords = new Set<string>();
  const words = query.toLowerCase().split(/\s+/);

  // Technology keywords
  const techKeywords = ["github", "gmail", "email", "slack", "notion"];
  // Action keywords
  const actionKeywords = [
    "create",
    "update",
    "delete",
    "send",
    "get",
    "list",
    "search",
    "find",
  ];
  // Object keywords
  const objectKeywords = [
    "repo",
    "repository",
    "issue",
    "pull",
    "request",
    "commit",
    "branch",
    "email",
    "message",
    "draft",
  ];

  const allKeywords = [...techKeywords, ...actionKeywords, ...objectKeywords];

  words.forEach((word) => {
    if (allKeywords.includes(word)) {
      keywords.add(word);
    }
  });

  return Array.from(keywords);
}

export async function POST(req: NextRequest) {
  try {
    const { message, workspaceContext, workspaceId, conversationHistory } =
      await req.json();

    if (!message || !workspaceId) {
      return NextResponse.json(
        { error: "Message and workspaceId are required" },
        { status: 400 }
      );
    }

    console.log("[Chatbot Assistant] Processing request:", message);

    // Check cache for common queries (only for simple questions)
    const isSimpleQuery = !/\b(create|update|delete|send|add|remove)\b/i.test(
      message.toLowerCase()
    );
    const cacheKey = isSimpleQuery
      ? `${workspaceId}-${message.toLowerCase().trim()}`
      : null;

    if (cacheKey && queryCache.has(cacheKey)) {
      const cached = queryCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("[Chatbot Assistant] Returning cached response");
        return NextResponse.json({
          success: true,
          response: cached.response,
          sources: [],
          actions: [],
          toolResults: [],
          assistantId: null,
          cached: true,
        });
      } else {
        queryCache.delete(cacheKey); // Remove expired cache
      }
    }

    // Search for relevant workspace content using semantic search
    let searchResults: any[] = [];
    try {
      searchResults = await convex.action(api.search.searchAllSemantic, {
        workspaceId,
        query: message,
        limit: 5, // Reduced from 10 to 5
      });
      console.log(
        "[Chatbot Assistant] Found",
        searchResults.length,
        "search results"
      );
    } catch (error) {
      console.warn(
        "[Chatbot Assistant] Search failed, continuing without context:",
        error
      );
    }

    // Prepare enhanced workspace context with search results (truncated for cost efficiency)
    const enhancedContext = `
${workspaceContext || ""}

SEARCH RESULTS FROM WORKSPACE:
${searchResults
  .map(
    (result, index) => `
${index + 1}. [${result.type.toUpperCase()}] ${result.text?.substring(0, 200) || ""}${result.text?.length > 200 ? "..." : ""}
   ID: ${result._id}
   ${result.type === "message" ? `Channel: ${(result as any).channelId || "Unknown"}` : ""}
   ${result.type === "task" ? `Status: ${(result as any).status || "Unknown"} | Completed: ${(result as any).completed || false}` : ""}
   ${result.type === "note" ? `Channel: ${(result as any).channelId || "Unknown"}` : ""}
   ${result.type === "card" ? `List: ${(result as any).listName || "Unknown"} | Channel: ${(result as any).channelName || "Unknown"}` : ""}
`
  )
  .join("")}
`;

    // Initialize Composio client and get available tools (enhanced with critical fallbacks)
    const userId = `workspace_${workspaceId}`; // Always use workspace-scoped entity ID
    let composioTools: any[] = [];
    let connectedApps: any[] = [];
    let connectedAppsDescriptions = "No external integrations connected";

    try {
      const composio = createComposioClient();

      // Check which apps are connected (check any connections, not just for specific entity)
      connectedApps = await getAnyConnectedApps(composio, workspaceId);

      console.log(
        "[Chatbot Assistant] Connected apps from getAnyConnectedApps:",
        connectedApps.map((app) => ({
          app: app.app,
          connected: app.connected,
          connectionId: app.connectionId,
        }))
      );

      // Get tools for connected apps only
      const connectedAppNames = connectedApps
        .filter((app) => app.connected)
        .map((app) => app.app) as AvailableApp[];

      // Create descriptions for connected apps
      const connectedAppsDescriptions =
        connectedAppNames.length > 0
          ? `Connected integrations: ${connectedAppNames.join(", ")}`
          : "No external integrations connected";

      console.log(
        "[Chatbot Assistant] Connected app names:",
        connectedAppNames
      );
      console.log(
        "[Chatbot Assistant] Connected apps descriptions:",
        connectedAppsDescriptions
      );

      if (connectedAppNames.length > 0) {
        // Always use workspace-scoped entity ID pattern for consistency
        const actualEntityId = `workspace_${workspaceId}`;

        console.log(
          `[Chatbot Assistant] Using workspace-scoped entity ID: ${actualEntityId} for tool fetching`
        );

        // Fetch ALL available tools first (cached)
        console.log(
          `[Chatbot Assistant] Fetching all tools for connected apps: ${connectedAppNames.join(",")}`
        );

        const allAvailableTools = await getAllToolsForApps(
          composio,
          actualEntityId,
          connectedAppNames,
          true // use cache
        );

        console.log(
          `[Chatbot Assistant] Loaded ${allAvailableTools.length} total tools from cache/API`
        );

        // Store all tools for later filtering
        composioTools = allAvailableTools;

        // Log tool breakdown for debugging
        const toolBreakdown = composioTools.reduce((acc: any, tool: any) => {
          const app = tool.toolkit || "unknown";
          acc[app] = (acc[app] || 0) + 1;
          return acc;
        }, {});

        console.log(`[Chatbot Assistant] Tool breakdown:`, toolBreakdown);
      } else {
        // No apps are connected - inform user about available workspace features only
        console.log(
          "[Chatbot Assistant] No external integrations connected - workspace-only mode"
        );

        // Early return if user is asking for external service features without connections
        const mentionsGitHub =
          message.toLowerCase().includes("github") ||
          message.toLowerCase().includes("repo");
        const mentionsGmail =
          message.toLowerCase().includes("gmail") ||
          message.toLowerCase().includes("email");

        if (mentionsGitHub || mentionsGmail) {
          return NextResponse.json({
            success: true,
            response: `I don't have access to ${mentionsGitHub ? "GitHub" : "Gmail"} because no external integrations are connected to this workspace. 

To use ${mentionsGitHub ? "GitHub" : "Gmail"} features, you need to:
1. Go to Workspace Settings → Integrations
2. Connect your ${mentionsGitHub ? "GitHub" : "Gmail"} account
3. Then I'll be able to help you with ${mentionsGitHub ? "repositories, issues, and pull requests" : "sending emails and managing your inbox"}

For now, I can help you with workspace content like messages, tasks, notes, and board cards.`,
            sources: [],
            actions: [],
            toolResults: [],
            assistantId: "proddy-ai",
          });
        }
      }

      console.log("[Chatbot Assistant] Connected apps:", connectedAppNames);
      console.log(
        "[Chatbot Assistant] Total tools loaded:",
        composioTools.length
      );
    } catch (error) {
      console.error(
        "[Chatbot Assistant] Failed to load Composio tools:",
        error
      );
      console.error("[Chatbot Assistant] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Set empty arrays so the chatbot continues to work
      connectedApps = [];
      composioTools = [];
    }

    // Create system prompt after determining connected apps
    const systemPrompt = `You are Proddy AI, a workspace assistant that helps teams stay organized.

CAPABILITIES:
- Search workspace content (messages, tasks, notes, boards)
- Use external tools (Gmail, GitHub, Slack) when connected
- Format responses with emojis and clear structure

TOOL USAGE INSTRUCTIONS:
- When users ask about GitHub repositories, issues, or pull requests, ALWAYS use the available GitHub tools
- When users want to send emails or check Gmail, ALWAYS use the available Gmail tools  
- Use tools proactively to provide real-time, accurate information
- Don't tell users to "check manually" if you have tools available

FORMATTING:
- Messages: "💬 **Chat** in #channel"
- Tasks: "✅ **Task**: [Title] - Status: [status]"
- Notes: "📝 **Note**: [Title]"
- Cards: "🎯 **Card**: [Title] in [List]"

WORKSPACE CONTEXT:
${enhancedContext}

Rules: 
1. ALWAYS use available tools when the user's request matches tool capabilities
2. If no workspace info available, say "I don't have information about that" ONLY if no external tools can help
3. Provide helpful, actionable responses using connected integrations

CONNECTED TOOLS:
${connectedAppsDescriptions}`;

    // Generate response using OpenAI directly with Composio tools
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Validate and add previous messages
      for (const historyMessage of conversationHistory) {
        if (historyMessage.role && historyMessage.content) {
          messages.push({
            role: historyMessage.role as "user" | "assistant",
            content: historyMessage.content,
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Smart tool selection: Filter tools based on query context
    const needsExternalTools =
      /\b(github|repository|repo|email|gmail|send|slack|channel|list|create|update|delete)\b/i.test(
        message.toLowerCase()
      );

    let toolsToUse: any[] | undefined = undefined;
    if (needsExternalTools && composioTools.length > 0) {
      // Filter tools based on the specific query
      const filteredTools = filterToolsForQuery(composioTools, message, {
        maxTools: 80, // Conservative limit for OpenAI
        preferDashboard: true,
        keywords: extractKeywords(message.toLowerCase()),
      });

      console.log(
        `[Chatbot Assistant] Filtered to ${filteredTools.length} relevant tools for query`
      );

      // Log some sample tools for debugging
      if (filteredTools.length > 0) {
        console.log(
          `[Chatbot Assistant] Top filtered tools:`,
          filteredTools
            .slice(0, 5)
            .map((t) => `${t.name} (score: ${t._score || "N/A"})`)
            .join(", ")
        );
      }

      toolsToUse = filteredTools;
    }

    console.log("[Chatbot Assistant] Tool usage decision:", {
      needsExternalTools,
      availableTools: composioTools.length,
      willUseTools: !!toolsToUse,
      toolsToOpenAI: toolsToUse?.length || 0,
      toolNames:
        toolsToUse?.map((t) => t.function?.name || t.name).slice(0, 10) || [],
      connectedApps: connectedApps
        .filter((app) => app.connected)
        .map((app) => `${app.app}:${app.connectionId}`),
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      tools: toolsToUse,
      messages,
      temperature: 0.7,
      max_tokens: 500, // Reduced from 1000 to 500
    });

    console.log("[Chatbot Assistant] OpenAI response:", {
      hasToolCalls: !!completion.choices[0]?.message?.tool_calls,
      toolCallsCount: completion.choices[0]?.message?.tool_calls?.length || 0,
      content:
        completion.choices[0]?.message?.content?.substring(0, 100) + "...",
      toolsProvided: toolsToUse?.length || 0,
    });

    let responseText =
      completion.choices[0]?.message?.content || "No response generated";
    let toolResults: any[] = [];

    // Handle tool calls if any
    if (
      completion.choices[0]?.message?.tool_calls &&
      completion.choices[0].message.tool_calls.length > 0
    ) {
      try {
        console.log("[Chatbot Assistant] Handling tool calls");

        const composio = createComposioClient();

        // Execute each tool call
        for (const toolCall of completion.choices[0].message.tool_calls) {
          if (toolCall.type === "function") {
            try {
              console.log(
                `[Chatbot Assistant] Executing tool: ${toolCall.function.name}`,
                {
                  arguments: toolCall.function.arguments,
                }
              );

              // Find the specific connection for this tool
              const toolApp = toolCall.function.name.includes("GITHUB")
                ? "GITHUB"
                : toolCall.function.name.includes("GMAIL")
                  ? "GMAIL"
                  : toolCall.function.name.includes("SLACK")
                    ? "SLACK"
                    : toolCall.function.name.includes("NOTION")
                      ? "NOTION"
                      : null;

              if (!toolApp) {
                throw new Error(
                  `Cannot determine app for tool: ${toolCall.function.name}`
                );
              }

              const connectionForTool = connectedApps.find(
                (app) => app.app === toolApp && app.connected
              );

              if (!connectionForTool) {
                throw new Error(`No connection found for ${toolApp}`);
              }

              console.log(`[Chatbot Assistant] Using connection:`, {
                app: connectionForTool.app,
                connectionId: connectionForTool.connectionId,
                entityId: userId, // Show the actual entity ID we're using
              });

              // Try actual execution
              let parsedArguments;
              try {
                parsedArguments = JSON.parse(toolCall.function.arguments);
              } catch (parseError) {
                throw new Error(
                  `Failed to parse tool arguments: ${parseError}`
                );
              }

              // Execute tool using the correct Composio SDK pattern
              // Try with connection ID first (more reliable than entity ID)
              const toolExecutionParams = {
                connectedAccountId: connectionForTool.connectionId,
                arguments: parsedArguments,
              };

              console.log(
                `[Chatbot Assistant] Tool execution params:`,
                toolExecutionParams
              );

              // Use connection ID approach which works reliably
              const result = await composio.tools.execute(
                toolCall.function.name,
                {
                  connectedAccountId: connectionForTool.connectionId,
                  arguments: parsedArguments,
                }
              );

              toolResults.push({
                toolCallId: toolCall.id,
                result: result,
                toolName: toolCall.function.name,
              });
            } catch (toolError) {
              console.error(
                `Tool execution error for ${toolCall.function.name}:`,
                toolError
              );
              toolResults.push({
                toolCallId: toolCall.id,
                error:
                  toolError instanceof Error
                    ? toolError.message
                    : "Tool execution failed",
                toolName: toolCall.function.name,
              });
            }
          }
        }

        // If we have tool results, create a follow-up completion
        if (toolResults.length > 0) {
          const toolMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            ...messages,
            completion.choices[0].message,
            ...toolResults.map((result) => ({
              role: "tool" as const,
              tool_call_id: result.toolCallId,
              content: result.error
                ? `Error: ${result.error}`
                : typeof result.result === "string"
                  ? result.result
                  : JSON.stringify(result.result),
            })),
          ];

          const followUpCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: toolMessages,
            temperature: 0.7,
            max_tokens: 500, // Reduced from 1000 to 500
          });

          responseText =
            followUpCompletion.choices[0]?.message?.content || responseText;
        }
      } catch (error) {
        console.error("[Chatbot Assistant] Error handling tool calls:", error);
      }
    }

    console.log("[Chatbot Assistant] Response generated");

    // Prepare sources for the response
    const sources = searchResults.map((result: any) => ({
      id: result._id,
      type: result.type,
      text:
        result.text.substring(0, 100) + (result.text.length > 100 ? "..." : ""),
    }));

    // Generate navigation actions based on search results
    const actions = [];

    // Check for notes content
    const notesResults = searchResults.filter(
      (result: any) => result.type === "note"
    );
    if (notesResults.length > 0) {
      const firstNote = notesResults[0];
      const channelId = (firstNote as any).channelId;
      if (channelId) {
        actions.push({
          label: "View Note",
          type: "note",
          url: `/workspace/[workspaceId]/channel/[channelId]/notes?noteId=[noteId]`,
          noteId: firstNote._id.toString(),
          channelId: channelId.toString(),
        });
      }
    }

    // Check for board cards content
    const cardResults = searchResults.filter(
      (result: any) => result.type === "card"
    );
    if (cardResults.length > 0) {
      const firstCard = cardResults[0];
      const channelId = (firstCard as any).channelId;
      if (channelId) {
        actions.push({
          label: "View Board",
          type: "board",
          url: `/workspace/[workspaceId]/channel/[channelId]/board`,
          channelId: channelId.toString(),
        });
      }
    }

    // Check for task content
    if (searchResults.some((result: any) => result.type === "task")) {
      actions.push({
        label: "View Tasks",
        type: "task",
        url: "/workspace/[workspaceId]/tasks",
      });
    }

    // Check for message content
    const messageResults = searchResults.filter(
      (result) => result.type === "message"
    );
    if (messageResults.length > 0) {
      const firstMessage = messageResults[0];
      const channelId = (firstMessage as any).channelId;
      if (channelId) {
        actions.push({
          label: "View Channel Chats",
          type: "message",
          url: `/workspace/[workspaceId]/channel/[channelId]/chats`,
          channelId: channelId.toString(),
        });
      }
    }

    // Cache response for simple queries
    if (cacheKey && isSimpleQuery) {
      queryCache.set(cacheKey, {
        response: responseText,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      sources,
      actions,
      toolResults,
      assistantType: "chatbot",
      composioToolsUsed: composioTools.length > 0,
    });
  } catch (error) {
    console.error("[Chatbot Assistant] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
