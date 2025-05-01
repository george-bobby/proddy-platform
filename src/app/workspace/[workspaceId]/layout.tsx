'use client';

import { Loader } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import type { Id } from '@/../convex/_generated/dataModel';
import { SummarizeButton } from '@/components/summarize-button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { MessageSelectionProvider } from '@/contexts/message-selection-context';
import { Profile } from '@/features/members/components/profile';
import { Thread } from '@/features/messages/components/thread';
import { StatusTracker } from '@/features/status/components/status-tracker';
import { usePanel } from '@/hooks/use-panel';

import { WorkspaceSidebar } from './workspace-sidebar';

const WorkspaceIdLayout = ({ children }: Readonly<PropsWithChildren>) => {
  const { parentMessageId, profileMemberId, onClose } = usePanel();

  const showPanel = !!parentMessageId || !!profileMemberId;

  return (
    <MessageSelectionProvider>
      <StatusTracker />
      <div className="h-full">
        <div className="flex h-full">
          <ResizablePanelGroup direction="horizontal" autoSaveId="workspace-layout">
            <ResizablePanel defaultSize={20} minSize={11} className="bg-tertiary">
              <WorkspaceSidebar />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={80} minSize={20}>
              {children}
            </ResizablePanel>

            {showPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20} defaultSize={29}>
                  {parentMessageId ? (
                    <Thread messageId={parentMessageId as Id<'messages'>} onClose={onClose} />
                  ) : profileMemberId ? (
                    <Profile memberId={profileMemberId as Id<'members'>} onClose={onClose} />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        <SummarizeButton />
      </div>
    </MessageSelectionProvider>
  );
};

export default WorkspaceIdLayout;
