import { NextRequest, NextResponse } from "next/server";
import { createComposioClient } from "@/lib/composio-config";
import { initializeComposio } from "@/lib/composio";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Finalizes a Composio connection for a workspace and returns a JSON response.
 *
 * Verifies the existence of a recent connection for the provided app and workspace entity,
 * attempts to persist an auth config and connected account (best-effort; failures are logged
 * and do not cause the endpoint to fail), and returns the connected account details and a
 * redirect URL on success.
 *
 * @param req - NextRequest whose JSON body must include:
 *   - workspaceId: string (required)
 *   - app: string (required) — app name, integrationId, or toolkit slug to match
 *   - memberId: string (required) — ID of the acting member
 *   - redirectUrl?: string (optional) — URL to return to after completion
 *
 * Responses:
 *   - 200: { success: true, connectedAccount, app, connectionId, entityId, message, redirectUrl }
 *   - 400: when workspaceId, app, or memberId are missing
 *   - 404: when no matching connection is found for the workspace/app
 *   - 500: on unexpected server errors
 */
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, app, memberId, redirectUrl } = await req.json();

    if (!workspaceId || !app || !memberId) {
      return NextResponse.json(
        { error: "workspaceId, app, and memberId are required" },
        { status: 400 },
      );
    }

    console.log(
      `[Connection Complete] Completing ${app} connection for workspace ${workspaceId}`,
    );

    // Use consistent workspace entity ID pattern
    const entityId = `workspace_${workspaceId}`;
    const { apiClient } = initializeComposio();

    // Get connections to verify the connection was established
    const connectionsResponse = await apiClient.getConnections(entityId);
    const connectedAccounts = connectionsResponse.items || [];

    // Find the most recent connection for this app
    const connectedAccount = connectedAccounts.find((account: any) => {
      return (
        account.appName?.toLowerCase() === app.toLowerCase() ||
        account.integrationId?.toLowerCase() === app.toLowerCase() ||
        account.toolkit?.slug?.toLowerCase() === app.toLowerCase()
      );
    });

    if (!connectedAccount) {
      return NextResponse.json(
        {
          error: "Connection not found",
          details: `No active connection found for ${app}. Please try connecting again.`,
        },
        { status: 404 },
      );
    }

    console.log(
      `[Connection Complete] Found connection: ${connectedAccount.id} for ${app}`,
    );

    // Store connected account in database (consistent with agentauth)
    try {
      // Get or create auth config for this app
      let authConfigId;
      try {
        const existingAuthConfig = await convex.query(
          api.integrations.getAuthConfigByToolkit,
          {
            workspaceId: workspaceId as Id<"workspaces">,
            toolkit: app as any,
          },
        );
        authConfigId = existingAuthConfig?._id;
      } catch (error) {
        console.log("Auth config doesn't exist, will create new one");
      }

      if (!authConfigId) {
        authConfigId = await convex.mutation(api.integrations.storeAuthConfig, {
          workspaceId: workspaceId as Id<"workspaces">,
          toolkit: app as any,
          name: `${app.charAt(0).toUpperCase() + app.slice(1)} Config`,
          type: "use_composio_managed_auth",
          composioAuthConfigId: connectedAccount.id,
          isComposioManaged: true,
          createdBy: memberId as Id<"members">,
        });
      }

      // Store connected account
      await convex.mutation(api.integrations.storeConnectedAccount, {
        workspaceId: workspaceId as Id<"workspaces">,
        authConfigId: authConfigId,
        userId: entityId,
        composioAccountId: connectedAccount.id,
        toolkit: app as any,
        status: "ACTIVE",
        metadata: connectedAccount,
        connectedBy: memberId as Id<"members">,
      });

      console.log(`[Connection Complete] Connected account stored for ${app}`);
    } catch (error) {
      console.warn("Failed to store connected account:", error);
      // Don't fail the whole request if database storage fails
    }

    return NextResponse.json({
      success: true,
      connectedAccount,
      app,
      connectionId: connectedAccount.id,
      entityId,
      message: `${app} connected successfully`,
      redirectUrl:
        redirectUrl || `/workspace/${workspaceId}/settings/integrations`,
    });
  } catch (error) {
    console.error("[Connection Complete] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to complete connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
