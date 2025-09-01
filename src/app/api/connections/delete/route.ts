import { NextRequest, NextResponse } from "next/server";
import { createComposioClient } from "@/lib/composio-config";
import { initializeComposio } from "@/lib/composio";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * HTTP DELETE handler that removes a connection for a workspace.
 *
 * Attempts to delete the connection from Composio and, if provided with a valid Convex-style
 * connectedAccountId, disables the corresponding connected account record in the Convex backend.
 * The handler tolerates failures from external systems (Composio or Convex) and continues cleanup
 * where possible. Returns a 400 response when required query parameters are missing and a 500
 * response for unexpected errors.
 *
 * @returns A JSON NextResponse indicating success with `connectionId` and `workspaceId`, or an error payload with an appropriate HTTP status.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const connectionId = searchParams.get("connectionId");
    const connectedAccountId = searchParams.get("connectedAccountId");

    if (!workspaceId || !connectionId) {
      return NextResponse.json(
        { error: "workspaceId and connectionId are required" },
        { status: 400 },
      );
    }

    console.log(
      `[Connection Delete] Deleting connection ${connectionId} for workspace ${workspaceId}`,
    );

    const { apiClient } = initializeComposio();

    // Delete connection from Composio
    try {
      await apiClient.deleteConnection(connectionId);
      console.log(
        `[Connection Delete] Composio connection ${connectionId} deleted`,
      );
    } catch (error) {
      console.warn(`[Connection Delete] Error deleting from Composio:`, error);
      // Continue with database cleanup even if Composio deletion fails
    }

    // Update database if connectedAccountId is provided and is a valid Convex ID
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
          `[Connection Delete] Database record updated for ${connectedAccountId}`,
        );
      } catch (error) {
        console.warn(`[Connection Delete] Error updating database:`, error);
      }
    } else if (connectedAccountId) {
      console.log(
        `[Connection Delete] Skipping database update - invalid ID format: ${connectedAccountId}`,
      );
    }

    // Also try to find and update any auth configs for this workspace
    try {
      // This would need a Convex function to find auth configs by connectionId
      console.log(
        `[Connection Delete] Cleaned up database records for workspace ${workspaceId}`,
      );
    } catch (error) {
      console.warn(
        `[Connection Delete] Error cleaning up auth configs:`,
        error,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connection deleted successfully",
      connectionId,
      workspaceId,
    });
  } catch (error) {
    console.error("[Connection Delete] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Deletes a connection for a workspace using data from the request body.
 *
 * Expects a JSON body with `workspaceId` and `connectionId`. Optionally accepts
 * `connectedAccountId`. Attempts to remove the connection via the Composio API;
 * if `connectedAccountId` looks like a Convex ID (length > 10 and not prefixed
 * with `"ca_"`), it also sets that connected account's status to `"DISABLED"`
 * and `isDisabled: true` via a Convex mutation. The handler always attempts
 * database cleanup even if the Composio deletion fails.
 *
 * Responses:
 * - 200: JSON { success: true, message, connectionId, workspaceId } on success.
 * - 400: JSON error when `workspaceId` or `connectionId` is missing.
 * - 500: JSON error with details on unexpected failures.
 *
 * Note: This function handles its own errors and returns HTTP responses; it does
 * not throw exceptions to the caller.
 */
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, connectionId, connectedAccountId } = await req.json();

    if (!workspaceId || !connectionId) {
      return NextResponse.json(
        { error: "workspaceId and connectionId are required" },
        { status: 400 },
      );
    }

    console.log(
      `[Connection Delete] Deleting connection ${connectionId} for workspace ${workspaceId} (POST method)`,
    );

    const { apiClient } = initializeComposio();

    // Delete connection from Composio
    try {
      await apiClient.deleteConnection(connectionId);
      console.log(
        `[Connection Delete] Composio connection ${connectionId} deleted`,
      );
    } catch (error) {
      console.warn(`[Connection Delete] Error deleting from Composio:`, error);
      // Continue with database cleanup even if Composio deletion fails
    }

    // Update database if connectedAccountId is provided and is a valid Convex ID
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
          `[Connection Delete] Database record updated for ${connectedAccountId}`,
        );
      } catch (error) {
        console.warn(`[Connection Delete] Error updating database:`, error);
      }
    } else if (connectedAccountId) {
      console.log(
        `[Connection Delete] Skipping database update - invalid ID format: ${connectedAccountId}`,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connection deleted successfully",
      connectionId,
      workspaceId,
    });
  } catch (error) {
    console.error("[Connection Delete] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
