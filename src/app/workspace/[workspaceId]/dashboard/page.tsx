'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useCurrentUser } from '@/features/auth/api/use-current-user';
import { DashboardChatbot } from '@/features/dashboard/components/dashboard-chatbot';
import { DashboardWidgets } from '@/features/dashboard/components/dashboard-widgets';
import { Loader, LayoutDashboard } from 'lucide-react';
import { WorkspaceToolbar } from '../toolbar';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

const DashboardPage = () => {
  // Set document title
  useDocumentTitle('Dashboard');

  const workspaceId = useWorkspaceId();

  // Get current member to check permissions
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  // Get current user data
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // Create enhanced member object with user data
  const enhancedMember = useMemo(() => {
    if (!member || !currentUser) return null;

    return {
      _id: member._id,
      userId: member.userId,
      role: member.role,
      workspaceId: member.workspaceId,
      user: {
        name: currentUser.name || 'User',
        image: currentUser.image
      }
    };
  }, [member, currentUser]);

  if (!workspaceId || memberLoading || userLoading || !enhancedMember) {
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
            <DashboardChatbot workspaceId={workspaceId} member={enhancedMember} />
          </div>

          {/* Widgets section - 60% width on desktop */}
          <div className="w-full md:w-[60%] flex flex-col">
            <DashboardWidgets workspaceId={workspaceId} member={enhancedMember} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
