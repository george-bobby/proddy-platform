import { Composio } from "@composio/core";
import { OpenAIProvider } from "@composio/openai";
import OpenAI from "openai";

// Initialize OpenAI client
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Composio client with OpenAI provider
export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new OpenAIProvider(),
});

export default composio;

/**
 * Create and configure a Composio instance and a small API client wrapper for common operations.
 *
 * The function validates the COMPOSIO_API_KEY environment variable, constructs a Composio instance
 * with an OpenAI provider, and returns that instance together with `apiClient`, which exposes:
 * - `createConnection(userId, appName)`: initiates a connected account flow and returns { redirectUrl, connectionId, id }.
 * - `getConnections(userId)`: lists connections for the given user.
 * - `getConnectionStatus(connectionId)`: retrieves a single connection by id.
 * - `getTools(userId, appNames)`: fetches tools for the user and apps, returned as `{ items: any[] }`.
 * - `deleteConnection(connectionId)`: deletes a connection.
 *
 * The wrapper uses available composio APIs (`connectedAccounts`, `connections`, `tools`) and provides
 * basic error logging; callers should handle errors thrown by these methods.
 *
 * @returns An object containing:
 *  - `composio`: the initialized Composio instance.
 *  - `apiClient`: the helper API client with methods described above.
 * @throws If COMPOSIO_API_KEY is not set in the environment.
 */
export function initializeComposio() {
  if (!process.env.COMPOSIO_API_KEY) {
    throw new Error("COMPOSIO_API_KEY environment variable is required");
  }

  const composioInstance = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
    provider: new OpenAIProvider(),
  });

  // Create API client wrapper for common operations
  const apiClient = {
    // Create connection for a user and app
    async createConnection(userId: string, appName: string) {
      try {
        // Import APP_CONFIGS to get auth config ID
        const { APP_CONFIGS } = await import("./composio-config");

        // Convert appName to uppercase to match our config keys
        const appKey = appName.toUpperCase() as keyof typeof APP_CONFIGS;
        const authConfigId = APP_CONFIGS[appKey]?.authConfigId;

        if (!authConfigId) {
          throw new Error(
            `Auth config ID not found for ${appName}. Please check your environment variables. Available apps: ${Object.keys(APP_CONFIGS).join(", ")}`,
          );
        }

        console.log(
          `[Composio API] Creating connection for ${appName} with auth config ID: ${authConfigId}`,
        );

        // Try to initiate connection using auth config ID
        const connection = await (
          composioInstance as any
        ).connectedAccounts?.initiate?.(userId, authConfigId);

        if (!connection) {
          throw new Error("Failed to create connection - method not available");
        }

        return {
          redirectUrl: connection.redirectUrl || connection.authUrl,
          connectionId: connection.id || connection.connectionId,
          id: connection.id || connection.connectionId,
        };
      } catch (error) {
        console.error("Error creating connection:", error);
        throw error;
      }
    },

    // Get connections for a user
    async getConnections(userId: string) {
      try {
        const connections =
          (await (composioInstance as any).connectedAccounts?.list?.({
            userIds: [userId],
          })) ||
          (await (composioInstance as any).connections?.list?.({
            entityId: userId,
          }));

        return connections;
      } catch (error) {
        console.error("Error getting connections:", error);
        throw error;
      }
    },

    // Get connection status
    async getConnectionStatus(connectionId: string) {
      try {
        const connection =
          (await (composioInstance as any).connectedAccounts?.get?.(
            connectionId,
          )) ||
          (await (composioInstance as any).connections?.get?.(connectionId));

        return connection;
      } catch (error) {
        console.error("Error getting connection status:", error);
        throw error;
      }
    },

    // Get tools for user and apps
    async getTools(userId: string, appNames: string[]) {
      try {
        const tools = await composioInstance.tools.get(userId, {
          appNames: appNames,
        } as any);

        return { items: Array.isArray(tools) ? tools : [tools] };
      } catch (error) {
        console.error("Error getting tools:", error);
        return { items: [] };
      }
    },

    // Delete connection
    async deleteConnection(connectionId: string) {
      try {
        (await (composioInstance as any).connectedAccounts?.delete?.(
          connectionId,
        )) ||
          (await (composioInstance as any).connections?.delete?.(connectionId));
      } catch (error) {
        console.error("Error deleting connection:", error);
        throw error;
      }
    },
  };

  return {
    composio: composioInstance,
    apiClient,
  };
}

/**
 * Fetches OpenAI-compatible tools for a given user filtered by app names.
 *
 * Returns an array of tools suitable for use with OpenAI (or an empty array
 * when no app names are provided or if fetching fails).
 *
 * @param userId - The ID of the user whose tools to retrieve.
 * @param appNames - List of application names to filter tools by; if empty, the function returns an empty array.
 * @returns An array of tool objects (may be empty).
 */
export async function getOpenAITools(userId: string, appNames: string[]) {
  if (!appNames.length) {
    return [];
  }

  try {
    // Get tools using the correct API according to TypeScript definitions
    const tools = await composio.tools.get(userId, {
      appNames: appNames,
    } as any);
    return tools;
  } catch (error) {
    console.error("Error fetching Composio OpenAI tools:", error);
    return [];
  }
}

/**
 * Execute a named Composio tool/action and return its result.
 *
 * Executes the specified action via the shared Composio client and returns the action's result.
 *
 * @param userId - The ID of the user on whose behalf the action is performed (used for context/auditing).
 * @param actionName - The name/identifier of the Composio tool or action to execute.
 * @param params - Parameters to pass to the action; expected as a plain object.
 * @returns The result returned by the Composio tool execution.
 * @throws Any error thrown by the underlying Composio client's execution call.
 */
export async function executeComposioAction(
  userId: string,
  actionName: string,
  params: Record<string, unknown>,
) {
  try {
    const result = await composio.tools.execute(actionName, params);
    return result;
  } catch (error) {
    console.error("Error executing Composio action:", error);
    throw error;
  }
}

/**
 * Delegates handling of OpenAI tool calls to the configured Composio provider.
 *
 * Passes an OpenAI response that may contain tool call instructions to the provider's
 * handleToolCalls implementation and returns whatever the provider returns.
 *
 * @param response - The OpenAI response object that may include tool call data.
 * @param userId - The user identifier for whom the tool calls should be executed.
 * @returns The provider's result from handling the tool calls.
 * @throws Rethrows any error raised by the provider's handler.
 */
export async function handleOpenAIToolCalls(response: unknown, userId: string) {
  try {
    // Use the provider's handle_tool_calls method
    const result = await (
      composio.provider as unknown as {
        handleToolCalls: (
          response: unknown,
          userId: string,
        ) => Promise<unknown>;
      }
    ).handleToolCalls(response, userId);
    return result;
  } catch (error) {
    console.error("Error handling OpenAI tool calls:", error);
    throw error;
  }
}

/**
 * Fetches Composio tools for the given user/apps formatted for OpenAI function-calling.
 *
 * Returns an array of tools suitable for passing to OpenAI (assumes Composio's OpenAI provider already formats tools).
 *
 * @param userId - The ID of the user whose tools to fetch.
 * @param appNames - List of app names to filter tools; if empty, the function returns an empty array.
 * @returns An array of tools compatible with OpenAI function-calling. Returns an empty array if `appNames` is empty or if fetching fails.
 */
export async function getComposioToolsForOpenAI(
  userId: string,
  appNames: string[],
) {
  if (!appNames.length) {
    return [];
  }

  try {
    const tools = await composio.tools.get(userId, {
      appNames: appNames,
    } as any);
    // Tools from Composio with OpenAI provider are already in the correct format
    return tools;
  } catch (error) {
    console.error("Error fetching Composio tools for OpenAI:", error);
    return [];
  }
}

/**
 * Sends a user message to OpenAI (GPT-4) augmented with Composio tools and returns the model's output or the result of any tool call.
 *
 * Fetches Composio tools for the given user and app names, invokes OpenAI chat completion with those tools, and if the model issues `tool_calls` delegates handling to Composio. Returns either the final text content from the model or whatever result is produced by handling the tool call.
 *
 * @param userId - ID of the user for whom tools should be retrieved.
 * @param appNames - List of app names whose tools should be made available to the model; if empty, no tools will be attached.
 * @param message - The user message to send to the model.
 * @returns The model's text response or the result returned from handling a tool call.
 * @throws Rethrows any error encountered while retrieving tools, calling OpenAI, or handling tool calls.
 */
export async function createOpenAICompletion(
  userId: string,
  appNames: string[],
  message: string,
) {
  try {
    // Get tools for the user
    const tools = await getComposioToolsForOpenAI(userId, appNames);

    // Create OpenAI completion with tools
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4",
      tools: tools as any,
      messages: [{ role: "user", content: message }],
    });

    // Handle tool calls if any
    if (response.choices[0].message.tool_calls) {
      const result = await handleOpenAIToolCalls(response, userId);
      return result;
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error creating OpenAI completion with Composio tools:",
      error,
    );
    throw error;
  }
}
