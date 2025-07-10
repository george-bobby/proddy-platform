'use client';

import { CalendarIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reactions } from '@/components/reactions';
import { ThreadBar } from '@/components/thread-bar';
import { Thumbnail } from '@/components/thumbnail';
import type { Doc, Id } from '../../../../convex/_generated/dataModel';

const Renderer = dynamic(() => import('@/components/renderer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

const Editor = dynamic(() => import('@/components/editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface MessageContentProps {
  id: Id<'messages'>;
  body: Doc<'messages'>['body'];
  image: string | null | undefined;
  isEditing: boolean;
  isAuthor: boolean;
  updatedAt: Doc<'messages'>['updatedAt'];
  calendarEvent?: {
    date: number;
    time?: string;
  };
  reactions: Array<
    Omit<Doc<'reactions'>, 'memberId'> & {
      count: number;
      memberIds: Id<'members'>[];
    }
  >;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
  isPending: boolean;
  onUpdate: ({ body }: { body: string }) => void;
  onCancel: () => void;
  onReaction: (value: string) => void;
  onOpenMessage: (id: Id<'messages'>) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const MessageContent = ({
  id,
  body,
  image,
  isEditing,
  isAuthor,
  updatedAt,
  calendarEvent,
  reactions,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
  isPending,
  onUpdate,
  onCancel,
  onReaction,
  onOpenMessage,
  onContextMenu,
}: MessageContentProps) => {
  // Check if this contains a custom message component
  const hasCustomMessageComponent = body && typeof body === 'string' &&
    (body.includes('"type":"canvas"') || body.includes('"type":"note"') ||
     body.includes('"type":"canvas-live"') || body.includes('"type":"note-live"') ||
     body.includes('"type":"canvas-export"') || body.includes('"type":"note-export"'));

  return (
    <div className={cn("relative group/message", isAuthor && "flex justify-end")}>
      <div
        className={cn(
          "rounded-lg text-sm cursor-pointer",
          // Apply different styling based on whether it's a custom message component
          hasCustomMessageComponent
            ? "p-0 bg-transparent" // No padding, no background for custom components
            : cn(
                "max-w-md px-3 py-2", // Normal styling for regular messages
                isAuthor ? "bg-primary text-primary-foreground" : "bg-muted"
              )
        )}
        onContextMenu={onContextMenu}
      >
        {isEditing ? (
          <Editor
            onSubmit={onUpdate}
            disabled={isPending}
            defaultValue={JSON.parse(body)}
            onCancel={onCancel}
            variant="update"
          />
        ) : (
          <div className={cn(
            isAuthor && "text-white [&_.ql-editor]:text-white [&_.ql-editor_*]:text-white [&_p]:text-white [&_span]:text-white [&_div]:text-white [&_strong]:text-white [&_em]:text-white [&_u]:text-white [&_s]:text-white [&_a]:text-white [&_li]:text-white [&_ol]:text-white [&_ul]:text-white [&_blockquote]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white",
            // Exclude our custom message components from white text styling with stronger specificity
            isAuthor && "[&_[data-message-component='true']]:!text-gray-900 [&_[data-message-component='true']_*]:!text-inherit [&_[data-message-component='true']_.text-gray-900]:!text-gray-900 [&_[data-message-component='true']_.text-gray-600]:!text-gray-600 [&_[data-message-component='true']_.text-indigo-600]:!text-indigo-600 [&_[data-message-component='true']_.text-purple-600]:!text-purple-600 [&_[data-message-component='true']_.text-blue-600]:!text-blue-600 [&_[data-message-component='true']_.text-green-600]:!text-green-600"
          )}>
            <Renderer value={body} calendarEvent={calendarEvent} />
            <Thumbnail url={image} />

            {updatedAt ? <span className={cn("text-xs italic animate-fade-in", isAuthor ? "text-white/70" : "text-muted-foreground")}>(edited)</span> : null}
            {calendarEvent && (
              <div className={cn("flex items-center gap-1 text-xs mt-1", isAuthor ? "text-white/80" : "text-secondary")}>
                <CalendarIcon className="h-3 w-3" />
                <span>Calendar event: {new Date(calendarEvent.date).toLocaleDateString()}{calendarEvent.time ? ` at ${calendarEvent.time}` : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Reactions data={reactions} onChange={onReaction} />
      <ThreadBar
        count={threadCount}
        image={threadImage}
        name={threadName}
        timestamp={threadTimestamp}
        onClick={() => onOpenMessage(id)}
      />
    </div>
  );
};
