import { format, isToday, isYesterday } from 'date-fns';
import { CalendarIcon, Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import Quill from 'quill';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessageSelection } from '@/contexts/message-selection-context';
import { useRemoveMessage } from '@/features/messages/api/use-remove-message';
import { useUpdateMessage } from '@/features/messages/api/use-update-message';
import { useToggleReaction } from '@/features/reactions/api/use-toggle-reaction';
import { useConfirm } from '@/hooks/use-confirm';
import { usePanel } from '@/hooks/use-panel';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

import type { Doc, Id } from '../../convex/_generated/dataModel';
import { Hint } from './hint';
import { Reactions } from './reactions';
import { ThreadBar } from './thread-bar';
import { Thumbnail } from './thumbnail';
import { Toolbar } from './toolbar';

const Renderer = dynamic(() => import('./renderer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});
const Editor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface MessageProps {
  id: Id<'messages'>;
  memberId: Id<'members'>;
  authorName?: string;
  authorImage?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<'reactions'>, 'memberId'> & {
      count: number;
      memberIds: Id<'members'>[];
    }
  >;
  body: Doc<'messages'>['body'];
  image: string | null | undefined;
  createdAt: Doc<'messages'>['_creationTime'];
  updatedAt: Doc<'messages'>['updatedAt'];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<'messages'> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
  calendarEvent?: {
    date: number;
    time?: string;
  };
}

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm:ss a')}`;
};

export const Message = ({
  id,
  isAuthor,
  body,
  createdAt,
  image,
  isEditing,
  authorName = 'Member',
  authorImage,
  memberId,
  reactions,
  setEditingId,
  updatedAt,
  hideThreadButton,
  isCompact,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
  calendarEvent,
}: MessageProps) => {
  const [ConfirmDialog, confirm] = useConfirm('Delete message', 'Are you sure you want to delete this message? This cannot be undone.');
  const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();
  const { isMessageSelected } = useMessageSelection();
  const workspaceId = useWorkspaceId();

  const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();

  const avatarFallback = authorName.charAt(0).toUpperCase();
  const isPending = isUpdatingMessage || isRemovingMessage || isTogglingReaction;
  const isSelected = isMessageSelected(id);

  // Create a ref to store the extracted text
  const extractedTextRef = useRef<Record<string, string>>({});

  // Extract plain text from the message body using Quill
  const extractTextFromBody = (bodyJson: string): string => {
    // If we've already extracted this text, return the cached version
    if (extractedTextRef.current[bodyJson]) {
      return extractedTextRef.current[bodyJson];
    }

    try {
      // Create a temporary Quill instance
      const quill = new Quill(document.createElement('div'), {
        theme: 'snow'
      });

      // Disable editing
      quill.enable(false);

      // Parse the body and set the contents
      const contents = JSON.parse(bodyJson);

      // If it's already a string, return it directly
      if (typeof contents === 'string') {
        extractedTextRef.current[bodyJson] = contents;
        return contents;
      }

      // Set the contents in Quill
      quill.setContents(contents);

      // Extract the text
      const extractedText = quill.getText().trim();

      // Cache the result
      extractedTextRef.current[bodyJson] = extractedText;

      console.log('Extracted text using Quill:', extractedText);
      return extractedText;
    } catch (error) {
      console.error('Failed to extract text using Quill:', error);
      return '';
    }
  };

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success('Message updated.');
          setEditingId(null);
        },
        onError: () => {
          toast.error('Failed to update message.');
        },
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) return;

    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success('Message deleted.');

          if (parentMessageId === id) onClose();
        },
        onError: () => {
          toast.error('Failed to delete message.');
        },
      },
    );
  };

  const handleReaction = async (value: string) => {
    toggleReaction(
      { messageId: id, value },
      {
        onError: () => {
          toast.error('Failed to toggle reaction.');
        },
      },
    );
  };

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />

        <div
          className={cn(
            'group relative flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 transition-standard hover:shadow-sm rounded-[10px]',
            isEditing && 'bg-secondary/20 hover:bg-secondary/20',
            isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-standard',
            isSelected && 'bg-primary/10 hover:bg-primary/10',
          )}
        >
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-2">
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="w-[40px] text-center text-sm leading-[22px] text-muted-foreground opacity-0 hover:underline group-hover:opacity-100">
                  {format(new Date(createdAt), 'hh:mm')}
                </button>
              </Hint>
            </div>

            {isEditing ? (
              <div className="size-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex w-full flex-col">
                <Renderer value={body} calendarEvent={calendarEvent} />
                <Thumbnail url={image} />

                {updatedAt ? <span className="text-xs text-muted-foreground italic animate-fade-in">(edited)</span> : null}
                {calendarEvent && (
                  <div className="flex items-center gap-1 text-xs text-primary mt-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Calendar event: {new Date(calendarEvent.date).toLocaleDateString()}{calendarEvent.time ? ` at ${calendarEvent.time}` : ''}</span>
                  </div>
                )}

                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => onOpenMessage(id)}
                />
              </div>
            )}
          </div>

          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleDelete}
              handleReaction={handleReaction}
              hideThreadButton={hideThreadButton}
              messageId={id as string}
              workspaceId={workspaceId}
              messageContent={extractTextFromBody(body)}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />

      <div
        className={cn(
          'group relative flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 transition-standard hover:shadow-sm rounded-[10px]',
          isEditing && 'bg-secondary/20 hover:bg-secondary/20',
          isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-standard',
          isSelected && 'bg-primary/10 hover:bg-primary/10',
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => onOpenProfile(memberId)}>
              <Avatar>
                <AvatarImage alt={authorName} src={authorImage} />

                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </button>
          </div>

          {isEditing ? (
            <div className="size-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex w-full flex-col overflow-hidden">
              <div className="text-sm">
                <button onClick={() => onOpenProfile(memberId)} className="font-bold text-primary hover:underline transition-all duration-200 hover:text-primary/80">
                  {authorName}
                </button>

                <span>&nbsp;&nbsp;</span>

                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline transition-all duration-200 hover:text-primary/50">{format(new Date(createdAt), 'h:mm a')}</button>
                </Hint>
              </div>

              <Renderer value={body} calendarEvent={calendarEvent} />
              <Thumbnail url={image} />

              {updatedAt ? <span className="text-xs text-muted-foreground italic animate-fade-in">(edited)</span> : null}
              {calendarEvent && (
                <div className="flex items-center gap-1 text-xs text-primary mt-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Calendar event: {new Date(calendarEvent.date).toLocaleDateString()}{calendarEvent.time ? ` at ${calendarEvent.time}` : ''}</span>
                </div>
              )}

              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleDelete}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
            messageId={id as string}
            workspaceId={workspaceId}
            messageContent={extractTextFromBody(body)}
          />
        )}
      </div>
    </>
  );
};
