import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import composio, { initializeComposio } from "@/lib/composio";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Validate composioAuthConfigId format
const validateAuthConfigFormat = (composioAuthConfigId: string): boolean => {
  // Accept any valid UUID or identifier format from Composio API
  return Boolean(composioAuthConfigId && composioAuthConfigId.length > 0);
};

/**
 * Handles authorization and connection completion for third-party toolkits.
 *
 * Processes POST requests with a JSON body containing `action`, `userId`, `toolkit`, `workspaceId`, and optional `memberId`.
 *
 * Behavior:
 * - action = "authorize": initiates a workspace-scoped connection (entityId = `workspace_<workspaceId>`) using the Composio API client and returns an OAuth `redirectUrl` and connection id. If `memberId` is provided, attempts to persist a Composio-managed auth config record.
 * - action = "complete": retrieves workspace-scoped connections, selects the most relevant connection for the requested `toolkit`, and returns the connected account. If `memberId` is provided, attempts to get-or-create an auth config and persist a connected account record in the database.
 *
 * Validation and responses:
 * - Requires `userId`, `toolkit`, and `workspaceId` in the request body; responds 400 if missing.
 * - Returns 400 for authorization errors or missing redirect URL.
 * - Returns 404 if no connected account is found during completion.
 * - Returns 500 for unexpected failures during completion or other server errors.
 *
 * Side effects:
 * - Initiates and deletes connections via the Composio API client.
 * - May create or update auth config and connected account records in the database when `memberId` is supplied.
 *
 * @param req - Incoming NextRequest containing the JSON body described above.
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[AgentAuth] POST request received");
    const body = await req.json();
    console.log("[AgentAuth] Request body:", body);

    const { action, userId, toolkit, workspaceId, memberId } = body;

    if (!userId || !toolkit || !workspaceId) {
      console.log("[AgentAuth] Missing required fields:", {
        userId,
        toolkit,
        workspaceId,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { composio, apiClient } = initializeComposio();

    if (action === "authorize") {
      // Always use workspace-scoped entity ID for all connections
      const entityId = `workspace_${workspaceId}`;
      console.log(
        `[AgentAuth] Authorizing workspace ${workspaceId} (entityId: ${entityId}) for ${toolkit}`,
      );

      try {
        // Step 1: Create entity and initiate connection using the API client
        const connection = await apiClient.createConnection(entityId, toolkit);

        // The API returns a redirectUrl for OAuth
        const redirectUrl = connection.redirectUrl;

        if (!redirectUrl) {
          console.error("No redirect URL received from Composio:", connection);
          return NextResponse.json(
            { error: "No redirect URL received from authorization" },
            { status: 400 },
          );
        }

        // Store auth config in database for tracking
        if (memberId) {
          try {
            // Store the auth config with Composio SDK format
            await convex.mutation(api.integrations.storeAuthConfig, {
              workspaceId: workspaceId as Id<"workspaces">,
              toolkit: toolkit as any,
              name: `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} Config`,
              type: "use_composio_managed_auth",
              composioAuthConfigId:
                connection.connectionId || `composio_${toolkit}_${Date.now()}`,
              isComposioManaged: true,
              createdBy: memberId as Id<"members">,
            });

            console.log(`[AgentAuth] Auth config stored for ${toolkit}`);
          } catch (error) {
            console.warn("Failed to store auth config:", error);
          }
        }

        return NextResponse.json({
          success: true,
          redirectUrl,
          connectionId: connection.connectionId || connection.id,
          message: `Redirect user to ${toolkit} authorization`,
        });
      } catch (error) {
        console.error("Authorization error:", error);
        return NextResponse.json(
          {
            error: `Failed to authorize toolkit: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 400 },
        );
      }
    }

    if (action === "complete") {
      // Always use workspace-scoped entity ID for all connections
      const entityId = `workspace_${workspaceId}`;
      console.log(
        `[AgentAuth] Completing connection for workspace ${workspaceId} (entityId: ${entityId}) and ${toolkit}`,
      );

      try {
        // Step 2: Get connections to verify connection using API client
        const connectionsResponse = await apiClient.getConnections(entityId);
        const connectedAccounts = connectionsResponse.items || [];

        // Find the most recent connection for this toolkit
        const connectedAccount =
          connectedAccounts.find((account: any) => {
            // Try to match by integration ID or toolkit name
            return (
              account.appName?.toLowerCase() === toolkit.toLowerCase() ||
              account.integrationId === toolkit
            );
          }) || connectedAccounts[0]; // Fallback to most recent if no exact match

        if (!connectedAccount) {
          return NextResponse.json(
            { error: "No connected account found" },
            { status: 404 },
          );
        }

        // Store connected account in database
        if (memberId) {
          try {
            // Get or create auth config for this toolkit
            let authConfigId;
            try {
              const existingAuthConfig = await convex.query(
                api.integrations.getAuthConfigByToolkit,
                {
                  workspaceId: workspaceId as Id<"workspaces">,
                  toolkit: toolkit as any,
                },
              );
              authConfigId = existingAuthConfig?._id;
            } catch (error) {
              // Auth config doesn't exist, create it
            }

            if (!authConfigId) {
              authConfigId = await convex.mutation(
                api.integrations.storeAuthConfig,
                {
                  workspaceId: workspaceId as Id<"workspaces">,
                  toolkit: toolkit as any,
                  name: `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} Config`,
                  type: "use_composio_managed_auth",
                  composioAuthConfigId: connectedAccount.id,
                  isComposioManaged: true,
                  createdBy: memberId as Id<"members">,
                },
              );
            }

            // Store connected account
            await convex.mutation(api.integrations.storeConnectedAccount, {
              workspaceId: workspaceId as Id<"workspaces">,
              authConfigId: authConfigId,
              userId,
              composioAccountId: connectedAccount.id,
              toolkit: toolkit as any, // Toolkit type validation
              status: "ACTIVE",
              metadata: connectedAccount,
              connectedBy: memberId as Id<"members">,
            });

            console.log(`[AgentAuth] Connected account stored for ${toolkit}`);
          } catch (error) {
            console.warn("Failed to store connected account:", error);
          }
        }

        return NextResponse.json({
          success: true,
          connectedAccount,
          message: `${toolkit} connected successfully`,
        });
      } catch (error) {
        console.error("Connection completion error:", error);
        return NextResponse.json(
          {
            error: `Failed to complete connection: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[AgentAuth] Error:", error);
    return NextResponse.json(
      { error: "AgentAuth operation failed" },
      { status: 500 },
    );
  }
}

/**
 * Unified GET handler for fetching integration-related data, checking connection status, and retrieving toolkit tools.
 *
 * Supported query actions (via URL search params):
 * - action=fetch-data & workspaceId
 *   - Returns { success: true, authConfigs, connectedAccounts }.
 *   - authConfigs are fetched from the database; connectedAccounts are derived from the Composio client and normalized to the module's expected shape.
 *   - On internal error returns success: true with empty arrays.
 *
 * - action=check-status & composioAccountId
 *   - Returns { connected: true, status, account } when the Composio client finds the connection.
 *   - If the account is not found or an error occurs, returns { connected: false, status: "NOT_FOUND", error }.
 *
 * - action=fetch-tools & userId & toolkit
 *   - Uses the API client to fetch available tools for the given user and toolkit.
 *   - Returns { success: true, tools, toolkit, userId } on success.
 *   - On failure returns a 500 response with an error message.
 *
 * Behavior and errors:
 * - For missing or invalid actions/parameters returns a 400 JSON error.
 * - Unexpected server errors return a 500 JSON error.
 *
 * Note: This function delegates Composio interactions to an initialized Composio API client and normalizes external data to the app's shape.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const workspaceId = searchParams.get("workspaceId");
    const userId = searchParams.get("userId");
    const toolkit = searchParams.get("toolkit");
    const composioAccountId = searchParams.get("composioAccountId");

    const { composio, apiClient } = initializeComposio();

    // Fetch auth configs and connected accounts for workspace
    if (action === "fetch-data" && workspaceId) {
      console.log(
        `[AgentAuth] Fetching integration data for workspace: ${workspaceId}`,
      );

      try {
        // Fetch auth configs from database
        const authConfigs = await convex.query(
          api.integrations.getAuthConfigsPublic,
          {
            workspaceId: workspaceId as Id<"workspaces">,
          },
        );

        // UPDATED: Fetch real connected accounts from Composio using the new helper
        const { createComposioClient, getAnyConnectedApps } = await import(
          "@/lib/composio-config"
        );
        const composioClient = createComposioClient();
        const realConnectedApps = await getAnyConnectedApps(
          composioClient,
          workspaceId,
        );

        // Transform the real connected apps to match the expected format
        const connectedAccounts = realConnectedApps
          .filter((app: any) => app.connected)
          .map((app: any) => ({
            _id: app.connectionId, // Use connection ID as _id
            workspaceId: workspaceId as Id<"workspaces">,
            authConfigId: `auth_${app.app.toLowerCase()}`, // Generate a fake auth config ID
            userId: app.entityId || `workspace_${workspaceId}`,
            composioAccountId: app.connectionId,
            toolkit: app.app.toLowerCase(), // Convert to lowercase to match expected format
            status: "ACTIVE", // Since these are filtered as connected
            metadata: {},
            isDisabled: false,
            connectedAt: Date.now(), // Use current time as fallback
            connectedBy: "system" as Id<"members">, // Placeholder
          }));

        console.log(
          `[AgentAuth] Found ${authConfigs.length} auth configs and ${connectedAccounts.length} connected accounts`,
        );

        return NextResponse.json({
          success: true,
          authConfigs,
          connectedAccounts,
        });
      } catch (convexError) {
        console.error("[AgentAuth] Error fetching data:", convexError);
        // Return empty arrays if there's an error
        return NextResponse.json({
          success: true,
          authConfigs: [],
          connectedAccounts: [],
        });
      }
    }

    // Check connection status
    if (action === "check-status" && composioAccountId) {
      console.log(
        `[AgentAuth] Checking status for account: ${composioAccountId}`,
      );

      try {
        const connectedAccount =
          await apiClient.getConnectionStatus(composioAccountId);

        return NextResponse.json({
          connected: true,
          status: connectedAccount.status,
          account: connectedAccount,
        });
      } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json({
          connected: false,
          status: "NOT_FOUND",
          error: "Account not found",
        });
      }
    }

    // Fetch tools for connected toolkit (Step 2 from documentation)
    if (action === "fetch-tools" && userId && toolkit) {
      console.log(
        `[AgentAuth] Fetching tools for user ${userId} and toolkit ${toolkit}`,
      );

      try {
        // Use API client to get tools for the user and toolkit
        const toolsResponse = await apiClient.getTools(userId, [toolkit]);
        const tools = toolsResponse.items || toolsResponse;

        return NextResponse.json({
          success: true,
          tools: tools,
          toolkit,
          userId,
        });
      } catch (error) {
        console.error("Tools fetch error:", error);
        return NextResponse.json(
          {
            error: `Failed to fetch tools: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        );
      }
    }

    // Default response for testing
    return NextResponse.json(
      {
        error: "Invalid action or missing required parameters",
        receivedAction: action,
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[AgentAuth] GET Error:", error);
    return NextResponse.json(
      { error: "AgentAuth GET operation failed" },
      { status: 500 },
    );
  }
}

/**
 * Disconnects a connected Composio account and optionally disables its local database record.
 *
 * Expects a JSON body with `workspaceId` and `composioAccountId`; `connectedAccountId` is optional.
 * - If `workspaceId` or `composioAccountId` is missing, responds with 400.
 * - Attempts to delete the connection from Composio. This step may fail without causing the overall
 *   operation to error.
 * - If a valid `connectedAccountId` that appears to be a local DB ID is provided, marks that record
 *   as disabled in the database. Database update failures are non-fatal and do not change the final response.
 *
 * @returns A NextResponse JSON object with `{ success: true, message: "Account disconnected successfully" }` on success,
 * or an error payload with HTTP status 400 (validation) or 500 (unexpected failure).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { workspaceId, connectedAccountId, composioAccountId } =
      await req.json();

    if (!workspaceId || !composioAccountId) {
      return NextResponse.json(
        { error: "workspaceId and composioAccountId are required" },
        { status: 400 },
      );
    }

    console.log(`[AgentAuth] Disconnecting account: ${composioAccountId}`);

    const { composio, apiClient } = initializeComposio();

    // First, disconnect from Composio using the API client
    try {
      await apiClient.deleteConnection(composioAccountId);
      console.log(
        `[AgentAuth] Successfully deleted from Composio: ${composioAccountId}`,
      );
    } catch (error) {
      console.warn("Error disconnecting from Composio:", error);
    }

    // If connectedAccountId is provided and looks like a valid Convex ID, update the database
    if (
      connectedAccountId &&
      connectedAccountId.length > 10 &&
      !connectedAccountId.startsWith("ca_")
    ) {
      try {
        await convex.mutation(api.integrations.updateConnectedAccountStatus, {
          connectedAccountId: connectedAccountId as Id<"connected_accounts">,
          status: "DISABLED",
          isDisabled: true,
        });
        console.log(
          `[AgentAuth] Database record updated for ${connectedAccountId}`,
        );
      } catch (error) {
        console.warn("Error updating database record:", error);
        // Don't fail the whole operation if database update fails
      }
    } else {
      console.log(
        `[AgentAuth] No valid database ID provided (got: ${connectedAccountId}), skipping database update`,
      );
    }

    console.log(`[AgentAuth] Account disconnected successfully`);

    return NextResponse.json({
      success: true,
      message: "Account disconnected successfully",
    });
  } catch (error) {
    console.error("[AgentAuth] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect account" },
      { status: 500 },
    );
  }
}
