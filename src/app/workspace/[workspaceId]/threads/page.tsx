'use client';

import { format } from 'date-fns';
import { Loader, MessageSquareText } from 'lucide-react';
import Link from 'next/link';

import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useGetThreadMessages } from '@/features/messages/api/use-get-thread-messages';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceHeader } from '../workspace-toolbar';

interface ThreadMessage {
  message: {
    _id: Id<'messages'>;
    _creationTime: number;
    body: string;
    memberId: Id<'members'>;
    image?: Id<'_storage'>;
    channelId?: Id<'channels'>;
    conversationId?: Id<'conversations'>;
    parentMessageId?: Id<'messages'>;
    workspaceId: Id<'workspaces'>;
    updatedAt?: number;
  };
  parentMessage: {
    _id: Id<'messages'>;
    _creationTime: number;
    body: string;
    memberId: Id<'members'>;
  };
  parentUser: {
    name: string;
    image?: string;
  };
  currentUser: {
    name: string;
    image?: string;
  };
  context: {
    name: string;
    type: 'channel' | 'conversation' | 'unknown';
    id: Id<'channels'> | Id<'conversations'>;
    memberId?: Id<'members'>;
  };
}

export default function ThreadsPage() {
  const workspaceId = useWorkspaceId();
  const threads = useGetThreadMessages() as ThreadMessage[] | undefined;

  if (!threads) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-white">
        <Loader className="size-12 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading threads...</p>
      </div>
    );
  }

  if (!threads.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-white">
        <MessageSquareText className="size-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Threads</h2>
        <p className="text-sm text-muted-foreground">No threads yet.</p>
      </div>
    );
  }

  const parseMessageBody = (body: string) => {
    try {
      const parsed = JSON.parse(body);
      if (parsed.ops && parsed.ops[0] && parsed.ops[0].insert) {
        return parsed.ops[0].insert;
      }
    } catch (e) {
      // If parsing fails, return the original body
      return body;
    }
    return body;
  };

  const getThreadUrl = (thread: ThreadMessage) => {
    if (thread.context.type === 'channel') {
      return `/workspace/${workspaceId}/channel/${thread.context.id}`;
    } else if (thread.context.type === 'conversation' && thread.context.memberId) {
      return `/workspace/${workspaceId}/member/${thread.context.memberId}`;
    }
    return '#';
  };

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <MessageSquareText className="mr-2 size-5" />
          <span className="truncate">Threads</span>
        </Button>
      </WorkspaceHeader>

      <div className="flex h-full flex-col gap-y-4 bg-white p-4">
        <h2 className="text-xl font-semibold">Your Threads</h2>

        <div className="flex flex-col gap-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.message._id}
              href={getThreadUrl(thread)}
              className="flex flex-col gap-y-2 rounded-lg border bg-white p-3 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {thread.context.type === 'channel' ? '#' : ''}{thread.context.name}
                </span>
              </div>

              {/* Parent Message */}
              <div className="flex flex-col gap-y-1 rounded-lg bg-gray-50 p-2">
                <div className="flex items-center gap-x-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {thread.parentUser.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(thread.parentMessage._creationTime), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{parseMessageBody(thread.parentMessage.body)}</p>
              </div>

              {/* Thread Message */}
              <div className="flex flex-col gap-y-1">
                <div className="flex items-center gap-x-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {thread.currentUser.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(thread.message._creationTime), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-sm">{parseMessageBody(thread.message.body)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
