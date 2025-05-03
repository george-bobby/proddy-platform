'use client';

import { format } from 'date-fns';
import { Mail, Loader } from 'lucide-react';
import Link from 'next/link';

import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useGetUserMessages } from '@/features/messages/api/use-get-user-messages';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceHeader } from '../toolbar';

type MessageContext = {
  name: string;
  type: 'channel' | 'conversation' | 'unknown';
  id: Id<'channels'> | Id<'conversations'>;
  memberId?: Id<'members'>;
};

interface Message {
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
  context: MessageContext;
}

export default function OutboxPage() {
  const workspaceId = useWorkspaceId();
  const messages = useGetUserMessages() as Message[] | undefined;

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

  const getMessageUrl = (message: Message) => {
    if (message.context.type === 'channel') {
      return `/workspace/${workspaceId}/channel/${message.context.id}/chats`;
    } else if (message.context.type === 'conversation' && message.context.memberId) {
      return `/workspace/${workspaceId}/member/${message.context.memberId}`;
    }
    return '#';
  };

  // Prepare the content based on messages state
  let content;

  if (!messages) {
    content = (
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-2 bg-white">
        <Loader className="size-12 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  } else if (!messages.length) {
    content = (
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-2 bg-white">
        <Mail className="size-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Outbox</h2>
        <p className="text-sm text-muted-foreground">No messages sent yet.</p>
      </div>
    );
  } else {
    // We have messages to display
    content = (
      <div className="flex h-full w-full flex-col gap-y-4 bg-white p-4">
        <h2 className="text-xl font-semibold">Your Messages</h2>

        <div className="flex flex-col gap-y-4">
          {messages.map((message) => (
            <Link
              key={message._id}
              href={getMessageUrl(message)}
              className="flex flex-col gap-y-1 rounded-lg border bg-white p-3 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {message.context.type === 'channel' ? '#' : ''}{message.context.name}
                </span>
              </div>
              <p className="text-sm">{parseMessageBody(message.body)}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(message._creationTime), 'MMM d, yyyy h:mm a')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Return the layout with a consistent structure
  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <Mail className="mr-2 size-5" />
          <span className="truncate">Outbox</span>
        </Button>
      </WorkspaceHeader>

      <div className="flex-1 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
