'use client';

import { Loader } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import type { Id } from '@/../convex/_generated/dataModel';
import { SummarizeButton } from '@/components/summarize-button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { MessageSelectionProvider } from '@/contexts/message-selection-context';
import { Profile } from '@/features/members/components/profile';
import { Thread } from '@/features/messages/components/thread';
import { StatusTracker } from '@/features/status/components/status-tracker';
import { usePanel } from '@/hooks/use-panel';
import { setupGlobalMentionHandler } from '@/lib/global-mention-handler';
import { debugMentions } from '@/lib/debug-mentions';
import { cn } from '@/lib/utils';

import { WorkspaceSidebar } from './sidebar';

const WorkspaceIdLayout = ({ children }: Readonly<PropsWithChildren>) => {
  const { parentMessageId, profileMemberId, onClose } = usePanel();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const showPanel = !!parentMessageId || !!profileMemberId;

  // Set up global mention handler
  useEffect(() => {
    setupGlobalMentionHandler();

    // Set up a timer to debug mentions after the page has loaded
    const timer = setTimeout(() => {
      debugMentions();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MessageSelectionProvider>
      <StatusTracker />
      <div className="h-full">
        <div className="flex h-full">
          <ResizablePanelGroup direction="horizontal" autoSaveId="workspace-layout">
            <ResizablePanel
              defaultSize={isCollapsed ? 5 : 25}
              minSize={isCollapsed ? 5 : 20}
              maxSize={isCollapsed ? 5 : 35}
              className="bg-tertiary/50"
              style={{
                width: isCollapsed ? '70px' : '280px',
                transition: 'width 300ms ease-in-out'
              }}
            >
              <div className="h-full overflow-y-auto overflow-x-hidden w-full">
                <WorkspaceSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className={cn(
                "transition-opacity duration-300",
                isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            />

            <ResizablePanel
              defaultSize={isCollapsed ? 95 : 75}
              minSize={30}
              style={{ transition: 'width 300ms ease-in-out' }}
            >
              <div className="h-full overflow-auto">
                {children}
              </div>
            </ResizablePanel>

            {showPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel
                  minSize={25}
                  defaultSize={29}
                  maxSize={40}
                  style={{ transition: 'width 300ms ease-in-out' }}
                >
                  <div className="h-full overflow-auto">
                    {parentMessageId ? (
                      <Thread messageId={parentMessageId as Id<'messages'>} onClose={onClose} />
                    ) : profileMemberId ? (
                      <Profile memberId={profileMemberId as Id<'members'>} onClose={onClose} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
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
