import { NextRequest, NextResponse } from "next/server";
import {
  createComposioClient,
  getConnectedApps,
  initiateAppConnection,
  AVAILABLE_APPS,
  APP_CONFIGS,
  type AvailableApp,
} from "@/lib/composio-config";

/**
 * HTTP GET handler for Composio-related queries.
 *
 * Supports the query action=status to return available app metadata and the current
 * connection status for a workspace. Expects a `workspaceId` query parameter.
 *
 * Responses:
 * - 200: { success: true, availableApps, appConfigs, connectedApps } when action=status.
 * - 400: { error: "workspaceId is required" } if `workspaceId` is missing.
 * - 400: { error: "Invalid action. Use action=status" } for unsupported actions.
 * - 500: { error: "Failed to fetch Composio status", details } on unexpected failures.
 *
 * @returns A NextResponse with JSON payload and appropriate HTTP status.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    const userId = `workspace_${workspaceId}`;
    const composio = createComposioClient();

    if (action === "status") {
      // Get connection status for all available apps
      const connectedApps = await getConnectedApps(composio, userId);

      return NextResponse.json({
        success: true,
        availableApps: Object.values(AVAILABLE_APPS),
        appConfigs: APP_CONFIGS,
        connectedApps,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use action=status" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Composio API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Composio status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST route handler for initiating Composio app connections.
 *
 * Validates the JSON body for `workspaceId` and `action`. When `action` is `"connect"`,
 * validates `app` against AVAILABLE_APPS, constructs a userId (`workspace_<workspaceId>`),
 * and calls `initiateAppConnection` to begin an OAuth/connection flow. On success returns a JSON
 * payload containing `success`, `app`, `redirectUrl`, `connectionId`, and a short message.
 *
 * Possible responses:
 * - 200: successful initiation with `success: true` and connection details.
 * - 400: missing/invalid `workspaceId`, `action`, or `app` (includes a list of valid apps when `app` is invalid).
 * - 500: server error with an error message in `details`.
 *
 * Does not throw; all errors are returned as JSON responses with appropriate HTTP status codes.
 *
 * @returns A NextResponse containing the JSON result and appropriate HTTP status code.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, workspaceId, app, redirectUrl } = await req.json();

    if (!workspaceId || !action) {
      return NextResponse.json(
        { error: "workspaceId and action are required" },
        { status: 400 },
      );
    }

    const userId = `workspace_${workspaceId}`;
    const composio = createComposioClient();

    if (action === "connect") {
      if (!app || !Object.values(AVAILABLE_APPS).includes(app)) {
        return NextResponse.json(
          {
            error: `Invalid app. Must be one of: ${Object.values(AVAILABLE_APPS).join(", ")}`,
          },
          { status: 400 },
        );
      }

      const result = await initiateAppConnection(
        composio,
        userId,
        app as AvailableApp,
        redirectUrl,
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          app,
          redirectUrl: result.redirectUrl,
          connectionId: result.connectionId,
          message: `Redirect to ${app} for authorization`,
        });
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Invalid action. Use action=connect" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Composio API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process Composio request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
