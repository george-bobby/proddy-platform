"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckSquare,
  FileText,
  Loader,
  Mail,
  RefreshCw,
  Settings,
  Ticket,
  Unlink,
} from "lucide-react";
import { FaGithub, FaSlack } from "react-icons/fa";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Id } from "../../../convex/_generated/dataModel";

type AuthConfig = {
  _id: Id<"auth_configs">;
  workspaceId: Id<"workspaces">;
  toolkit: "github" | "gmail" | "slack" | "jira" | "notion" | "clickup";
  name: string;
  type:
    | "use_composio_managed_auth"
    | "use_custom_auth"
    | "service_connection"
    | "no_auth";
  authScheme?: string;
  composioAuthConfigId: string;
  credentials?: any;
  isComposioManaged: boolean;
  isDisabled: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: Id<"members">;
};

type ConnectedAccount = {
  _id: Id<"connected_accounts">;
  workspaceId: Id<"workspaces">;
  authConfigId: Id<"auth_configs">;
  userId: string;
  composioAccountId: string;
  toolkit: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "ERROR" | "DISABLED";
  statusReason?: string;
  metadata?: any;
  testRequestEndpoint?: string;
  isDisabled: boolean;
  connectedAt: number;
  lastUsed?: number;
  connectedBy: Id<"members">;
};

type CurrentMember = {
  _id: Id<"members">;
  userId: string;
  role: "owner" | "admin" | "member";
};

interface ServiceIntegrationCardProps {
  workspaceId: Id<"workspaces">;
  toolkit: "github" | "gmail" | "slack" | "jira" | "notion" | "clickup";
  authConfig?: AuthConfig;
  connectedAccount?: ConnectedAccount;
  currentMember: CurrentMember;
  onConnectionChange?: () => void;
}

const toolkits = {
  github: {
    icon: FaGithub,
    color: "bg-gray-900 hover:bg-gray-800",
    name: "GitHub",
    description:
      "Connect to GitHub for repository management and issue tracking with AgentAuth",
  },
  gmail: {
    icon: Mail,
    color: "bg-red-600 hover:bg-red-700",
    name: "Gmail",
    description:
      "Connect to Gmail for email management and automation with AgentAuth",
  },
  slack: {
    icon: FaSlack,
    color: "bg-purple-600 hover:bg-purple-700",
    name: "Slack",
    description:
      "Connect to Slack for team communication and notifications with AgentAuth",
  },
  jira: {
    icon: Ticket,
    color: "bg-blue-600 hover:bg-blue-700",
    name: "Jira",
    description:
      "Connect to Jira for project management and issue tracking with AgentAuth",
  },
  notion: {
    icon: FileText,
    color: "bg-gray-800 hover:bg-gray-700",
    name: "Notion",
    description:
      "Connect to Notion for document management and collaboration with AgentAuth",
  },
  clickup: {
    icon: CheckSquare,
    color: "bg-pink-600 hover:bg-pink-700",
    name: "ClickUp",
    description:
      "Connect to ClickUp for task management and productivity with AgentAuth",
  },
};

export const ServiceIntegrationCard = ({
  workspaceId,
  toolkit,
  authConfig,
  connectedAccount,
  currentMember,
  onConnectionChange,
}: ServiceIntegrationCardProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    connectionId?: string;
    status?: string;
    error?: string;
  }>({ connected: !!connectedAccount && connectedAccount.status === "ACTIVE" });

  // Component state and derived values

  const IconComponent = toolkits[toolkit].icon;
  const isConnected = connectedAccount && connectedAccount.status === "ACTIVE";
  const isOwnerOrAdmin =
    currentMember.role === "owner" || currentMember.role === "admin";
  const hasAuthConfig = !!authConfig;

  const handleCreateAuthConfig = async () => {
    if (!isOwnerOrAdmin) {
      toast.error(
        "Only workspace owners and administrators can manage integrations",
      );
      return;
    }

    setIsConnecting(true);

    try {
      // Use AgentAuth to authorize user to toolkit
      const response = await fetch("/api/composio/agentauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "authorize",
          userId: `workspace_${workspaceId}`, // Use workspace entity ID pattern
          toolkit,
          workspaceId,
          memberId: currentMember._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to authorize toolkit");
      }

      const result = await response.json();

      // Redirect to service OAuth (AgentAuth handles the full flow)
      window.location.href = result.redirectUrl;
    } catch (error) {
      console.error(`Error authorizing ${toolkit}:`, error);
      toast.error(`Failed to authorize ${toolkits[toolkit].name}`);
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!isOwnerOrAdmin) {
      toast.error(
        "Only workspace owners and administrators can manage integrations",
      );
      return;
    }

    // With AgentAuth, we don't need a separate auth config step
    // The authorization and connection happen in one flow
    await handleCreateAuthConfig();
  };

  const handleDisconnect = async () => {
    if (!isOwnerOrAdmin) {
      toast.error(
        "Only workspace owners and administrators can manage integrations",
      );
      return;
    }

    if (!connectedAccount) {
      toast.error("No connected account found");
      return;
    }

    setIsDisconnecting(true);

    try {
      // Call AgentAuth API to disconnect the account
      const response = await fetch("/api/composio/agentauth", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          connectedAccountId: connectedAccount._id,
          composioAccountId: connectedAccount.composioAccountId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect account");
      }

      toast.success(`${toolkits[toolkit].name} disconnected successfully`);
      onConnectionChange?.();
    } catch (error) {
      console.error(`Error disconnecting ${toolkit}:`, error);
      toast.error(`Failed to disconnect ${toolkits[toolkit].name}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleCheckConnectionStatus = async () => {
    if (!connectedAccount?.composioAccountId) return;

    try {
      // Call AgentAuth API to check connection status
      const response = await fetch(
        `/api/composio/agentauth?action=check-status&composioAccountId=${connectedAccount.composioAccountId}`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const status = await response.json();
        setConnectionStatus(status);
      }
    } catch (error) {
      console.error(`Error checking ${toolkit} connection:`, error);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Connected badge as overlay */}
      {isConnected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <Check className="h-3 w-3" />
            <span className="font-medium">Connected</span>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 pr-20">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg text-white ${toolkits[toolkit].color}`}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{toolkits[toolkit].name}</CardTitle>
            <CardDescription className="text-sm">
              {toolkits[toolkit].description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            {connectedAccount.lastUsed && (
              <div className="text-sm text-muted-foreground">
                Last used:{" "}
                {new Date(connectedAccount.lastUsed).toLocaleDateString()}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckConnectionStatus}
                disabled={!isOwnerOrAdmin}
                className="bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200 hover:border-blue-300"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting || !isOwnerOrAdmin}
                className="bg-red-100 border-red-200 text-red-700 hover:bg-red-200 hover:border-red-300"
              >
                {isDisconnecting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!isOwnerOrAdmin && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Only workspace owners and administrators can connect services
                </span>
              </div>
            )}

            <Button
              onClick={handleCreateAuthConfig}
              disabled={isConnecting || !isOwnerOrAdmin}
              className={`w-full ${toolkits[toolkit].color} text-white`}
            >
              {isConnecting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Connecting with AgentAuth...
                </>
              ) : (
                <>
                  <IconComponent className="mr-2 h-4 w-4" />
                  Connect {toolkits[toolkit].name}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Subtle connection status indicator - only show for non-connected states */}
      {!isConnected && (
        <div
          className={`absolute bottom-3 right-3 w-2 h-2 rounded-full ${
            hasAuthConfig ? "bg-yellow-400" : "bg-gray-300"
          }`}
        />
      )}
    </Card>
  );
};
