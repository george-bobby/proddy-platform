'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { DashboardChatbot } from '@/features/dashboard/components/dashboard-chatbot';
import { DashboardWidgets } from '@/features/dashboard/components/dashboard-widgets';
import { Loader, LayoutDashboard } from 'lucide-react';
import { WorkspaceToolbar } from '../toolbar';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  // Set document title
  useDocumentTitle('Dashboard');

  const workspaceId = useWorkspaceId();

  // Get current member to check permissions
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  if (!workspaceId || memberLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <LayoutDashboard className="mr-2 size-5" />
          <span className="truncate">Dashboard</span>
        </Button>
      </WorkspaceToolbar>
      <div className="flex flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex w-full flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
          {/* Chatbot section - 40% width on desktop */}
          <div className="w-full md:w-[40%] flex flex-col">
            <DashboardChatbot workspaceId={workspaceId} member={member} />
          </div>

          {/* Widgets section - 60% width on desktop */}
          <div className="w-full md:w-[60%] flex flex-col">
            <DashboardWidgets workspaceId={workspaceId} member={member} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
