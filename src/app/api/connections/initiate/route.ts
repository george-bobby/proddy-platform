import { NextRequest, NextResponse } from "next/server";
import {
  createComposioClient,
  initiateAppConnection,
  AVAILABLE_APPS,
  type AvailableApp,
} from "@/lib/composio-config";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, app, redirectUrl, memberId } = await req.json();

    if (!workspaceId || !app || !memberId) {
      return NextResponse.json(
        { error: "workspaceId, app, and memberId are required" },
        { status: 400 }
      );
    }

    if (!Object.values(AVAILABLE_APPS).includes(app)) {
      return NextResponse.json(
        {
          error: `Invalid app. Must be one of: ${Object.values(AVAILABLE_APPS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    console.log(
      `[Connection Initiate] Starting connection for ${app} in workspace ${workspaceId}`
    );

    // Use consistent workspace entity ID pattern
    const entityId = `workspace_${workspaceId}`;
    const composio = createComposioClient();

    // Initiate connection using the composio-config function
    const result = await initiateAppConnection(
      composio,
      entityId,
      app as AvailableApp,
      redirectUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations/callback?workspaceId=${workspaceId}&app=${app}`
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Store auth config in database for tracking (consistent with agentauth)
    try {
      await convex.mutation(api.integrations.storeAuthConfig, {
        workspaceId: workspaceId as Id<"workspaces">,
        toolkit: app as any,
        name: `${app.charAt(0).toUpperCase() + app.slice(1)} Config`,
        type: "use_composio_managed_auth",
        composioAuthConfigId:
          result.connectionId || `composio_${app}_${Date.now()}`,
        isComposioManaged: true,
        createdBy: memberId as Id<"members">,
      });

      console.log(`[Connection Initiate] Auth config stored for ${app}`);
    } catch (error) {
      console.warn("Failed to store auth config:", error);
      // Don't fail the whole request if database storage fails
    }

    return NextResponse.json({
      success: true,
      app,
      redirectUrl: result.redirectUrl,
      connectionId: result.connectionId,
      entityId,
      message: `Redirect to ${app} for authorization`,
    });
  } catch (error) {
    console.error("[Connection Initiate] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
