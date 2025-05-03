'use client';

import { Loader } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import type { Id } from '@/../convex/_generated/dataModel';
import { SummarizeButton } from '@/components/summarize-button';

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
          {/* Fixed-width sidebar with collapse/expand functionality */}
          <div
            className={cn(
              "h-full bg-tertiary/50 overflow-y-auto overflow-x-hidden",
              "transition-all duration-300 ease-in-out flex-shrink-0 relative z-10",
              isCollapsed ? "w-[70px]" : "w-[280px]"
            )}
          >
            <WorkspaceSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </div>

          {/* Main content area */}
          <div className="flex-1 h-full overflow-auto">
            {children}
          </div>

          {/* Right panel for threads and profiles */}
          {showPanel && (
            <div className="w-[350px] h-full overflow-auto border-l border-border/30 flex-shrink-0 transition-all duration-300 ease-in-out">
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
          )}
        </div>
        <SummarizeButton />
      </div>
    </MessageSelectionProvider>
  );
};

export default WorkspaceIdLayout;
