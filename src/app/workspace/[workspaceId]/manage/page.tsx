"use client";

import { Settings, Users, Hash, Shield, Loader } from "lucide-react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkspaceManagement } from "@/features/manage/components/workspace-management";
import { ChannelsManagement } from "@/features/manage/components/channels-management";
import { MembersManagement } from "@/features/manage/components/members-management";
import { useRouter } from "next/navigation";

const ManagePage = () => {
  // Set document title
  useDocumentTitle("Manage Workspace");

  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  // Check if user has permission to access this page
  if (!memberLoading && member && member.role === "member") {
    // Redirect to workspace home if user is not an admin or owner
    router.push(`/workspace/${workspaceId}`);
    return null;
  }

  if (memberLoading || workspaceLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member || !workspace) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Workspace</h1>
          <p className="text-sm text-muted-foreground">
            Configure and manage your workspace settings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Workspace Management</CardTitle>
            <CardDescription>
              Manage your workspace settings, channels, and members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="workspace" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="workspace">
                  <Settings className="h-4 w-4 mr-2" />
                  Workspace
                </TabsTrigger>
                <TabsTrigger value="channels">
                  <Hash className="h-4 w-4 mr-2" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workspace">
                <WorkspaceManagement
                  workspace={workspace}
                  currentMember={member}
                />
              </TabsContent>

              <TabsContent value="channels">
                <ChannelsManagement
                  workspaceId={workspaceId}
                  currentMember={member}
                />
              </TabsContent>

              <TabsContent value="members">
                <MembersManagement
                  workspaceId={workspaceId}
                  currentMember={member}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagePage;
