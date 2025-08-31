"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FaGithub, FaSlack } from "react-icons/fa";
import { Mail, Ticket, FileText, CheckSquare } from "lucide-react";
import { ServiceIntegrationCard } from "./service-integration-card";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "../../../convex/_generated/dataModel";

type CurrentMember = {
  _id: Id<"members">;
  userId: string;
  role: "owner" | "admin" | "member";
};

interface IntegrationsManagementProps {
  workspaceId: Id<"workspaces">;
  currentMember: CurrentMember;
}

const SUPPORTED_TOOLKITS = [
  "github",
  "gmail",
  "slack",
  "jira",
  "notion",
  "clickup",
] as const;

const toolkits = {
  github: {
    icon: FaGithub,
    color: "bg-gray-900",
    name: "GitHub",
  },
  gmail: {
    icon: Mail,
    color: "bg-red-600",
    name: "Gmail",
  },
  slack: {
    icon: FaSlack,
    color: "bg-purple-600",
    name: "Slack",
  },
  jira: {
    icon: Ticket,
    color: "bg-blue-600",
    name: "Jira",
  },
  notion: {
    icon: FileText,
    color: "bg-gray-800",
    name: "Notion",
  },
  clickup: {
    icon: CheckSquare,
    color: "bg-pink-600",
    name: "ClickUp",
  },
};

// Loading card component
const LoadingCard = ({
  toolkit,
}: {
  toolkit: (typeof SUPPORTED_TOOLKITS)[number];
}) => {
  const IconComponent = toolkits[toolkit].icon;

  return (
    <Card className="relative overflow-hidden animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg text-white ${toolkits[toolkit].color} opacity-30`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>

      {/* Loading status indicator */}
      <div className="absolute top-0 right-0 w-3 h-3 rounded-full m-3 bg-gray-300 animate-pulse" />
    </Card>
  );
};

export const IntegrationsManagement = ({
  workspaceId,
  currentMember,
}: IntegrationsManagementProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  // State for data fetching
  const [authConfigs, setAuthConfigs] = useState<any[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from AgentAuth API route
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch auth configs and connected accounts using unified AgentAuth endpoint
      const response = await fetch(
        `/api/composio/agentauth?action=fetch-data&workspaceId=${workspaceId}`
      );

      if (response.ok) {
        const data = await response.json();
        setAuthConfigs(data.authConfigs || []);
        setConnectedAccounts(data.connectedAccounts || []);
      } else {
        console.warn("Failed to fetch integration data, using empty arrays");
        setAuthConfigs([]);
        setConnectedAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching integration data:", error);
      setAuthConfigs([]);
      setConnectedAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  const handleConnectionComplete = useCallback(
    async (toolkit: string, userId?: string) => {
      try {
        // Complete connection using AgentAuth with workspace-scoped entity ID
        const response = await fetch("/api/composio/agentauth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "complete",
            userId: userId || `workspace_${workspaceId}`, // Use workspace entity ID
            toolkit,
            workspaceId,
            memberId: currentMember._id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to complete AgentAuth connection");
        }

        const result = await response.json();

        // Refresh the data
        await fetchData();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error completing AgentAuth connection:", error);
        toast.error("Failed to complete connection setup");
      }
    },
    [workspaceId, currentMember._id, fetchData] // Removed currentMember.userId since we now use workspace entity ID
  );

  // Check if user just returned from OAuth (AgentAuth callback)
  useEffect(() => {
    const connected = searchParams.get("connected");
    const toolkit = searchParams.get("toolkit");
    const userId = searchParams.get("userId");

    if (connected === "true" && toolkit) {
      toast.success(
        `${toolkit.charAt(0).toUpperCase() + toolkit.slice(1)} authorization completed!`
      );

      // Handle the connection completion using AgentAuth
      handleConnectionComplete(toolkit, userId || undefined);

      // Remove the query parameters
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("connected");
      newUrl.searchParams.delete("toolkit");
      newUrl.searchParams.delete("userId");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router, handleConnectionComplete]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConnectionChange = () => {
    fetchData();
    setRefreshKey((prev) => prev + 1);
  };

  // Create maps for easier lookup
  const authConfigsByToolkit =
    authConfigs?.reduce(
      (acc, config) => {
        acc[config.toolkit] = config;
        return acc;
      },
      {} as Record<string, any>
    ) || {};

  const connectedAccountsByToolkit =
    connectedAccounts?.reduce(
      (acc, account) => {
        acc[account.toolkit] = account;
        return acc;
      },
      {} as Record<string, any>
    ) || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Service Integrations
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect your workspace to external services using Composio's unified
          AgentAuth system for AI-powered automation and enhanced productivity
          features.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Loading header with spinner */}
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Loading integrations...
              </span>
            </div>
          </div>

          {/* Loading cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_TOOLKITS.map((toolkit) => (
              <LoadingCard key={toolkit} toolkit={toolkit} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_TOOLKITS.map((toolkit) => (
            <ServiceIntegrationCard
              key={`${toolkit}-${refreshKey}`}
              workspaceId={workspaceId}
              toolkit={toolkit}
              authConfig={authConfigsByToolkit[toolkit]}
              connectedAccount={connectedAccountsByToolkit[toolkit]}
              currentMember={currentMember}
              onConnectionChange={handleConnectionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
