'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { CalendarIcon, Loader, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMessageSelection } from '@/features/smart/contexts/message-selection-context';
import { useRemoveMessage } from '@/features/messages/api/use-remove-message';
import { useUpdateMessage } from '@/features/messages/api/use-update-message';
import { useToggleReaction } from '@/features/reactions/api/use-toggle-reaction';
import { useCreateTaskFromMessage } from '@/features/tasks/api/use-create-task-from-message';
import { useConfirm } from '@/hooks/use-confirm';
import { usePanel } from '@/hooks/use-panel';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

import type { Doc, Id } from '../../convex/_generated/dataModel';
import { Hint } from './hint';
import { Reactions } from './reactions';
import { ThreadBar } from './thread-bar';
import { Thumbnail } from './thumbnail';


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
  const { isMessageSelected, toggleMessageSelection } = useMessageSelection();
  const workspaceId = useWorkspaceId();

  const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();
  const createTaskFromMessage = useCreateTaskFromMessage();

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
  }>({ show: false, x: 0, y: 0 });

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

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
      // First try to parse the body
      const contents = JSON.parse(bodyJson);

      // If it's already a string, return it directly
      if (typeof contents === 'string') {
        extractedTextRef.current[bodyJson] = contents;
        return contents;
      }

      // Always use the server-side rendering approach for safety
      // Try to extract text directly from the Delta object
      if (contents && contents.ops && Array.isArray(contents.ops)) {
        const text = contents.ops
          .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
          .join('')
          .trim();

        extractedTextRef.current[bodyJson] = text;
        return text;
      }

      // If we can't extract text, return an empty string
      return '';
    } catch (error) {
      console.error('Error extracting text from message body:', error);
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

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate menu dimensions (approximate)
    const menuWidth = 160;
    const menuHeight = 200; // Approximate height based on number of items

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position to keep menu within viewport
    let x = e.clientX;
    let y = e.clientY;

    // Adjust horizontal position if menu would go off-screen
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10; // 10px margin from edge
    }

    // Adjust vertical position if menu would go off-screen
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10; // 10px margin from edge
    }

    // Ensure minimum distance from edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    setContextMenu({
      show: true,
      x,
      y,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  const handleContextMenuAction = (action: string) => {
    switch (action) {
      case 'select':
        toggleMessageSelection(id);
        break;
      case 'copy':
        navigator.clipboard.writeText(extractTextFromBody(body));
        toast.success('Message copied to clipboard');
        break;
      case 'addToTask':
        handleAddToTask();
        break;
      case 'edit':
        setEditingId(id);
        break;
      case 'delete':
        handleDelete();
        break;
      case 'reply':
        onOpenMessage(id);
        break;
      default:
        console.log(`Action: ${action} for message:`, id);
    }
    handleCloseContextMenu();
  };

  const handleAddToTask = () => {
    const messageText = extractTextFromBody(body);
    setTaskContent(messageText);
    setTaskTitle(`Task from ${authorName}`);
    setShowTaskModal(true);
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      await createTaskFromMessage({
        messageId: id,
        workspaceId,
        title: taskTitle,
        dueDate: taskDueDate ? new Date(taskDueDate).getTime() : undefined,
        priority: 'medium', // Default priority
      });

      toast.success('Task created successfully');
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskContent('');
      setTaskDueDate('');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.show) {
        // Don't close if clicking on the context menu itself
        const target = e.target as Element;
        if (target && target.closest('.context-menu')) {
          return;
        }
        handleCloseContextMenu();
      }
    };

    if (contextMenu.show) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show]);

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />

        <div
          className={cn(
            'group relative flex items-start gap-3 p-3 hover:bg-gray-100/60 transition-standard hover:shadow-sm rounded-[10px]',
            isEditing && 'bg-secondary/20 hover:bg-secondary/20',
            isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-standard',
            isSelected && 'bg-secondary/10 hover:bg-secondary/10',
            isAuthor && 'flex-row-reverse'
          )}
          onContextMenu={handleContextMenu}
        >
          {/* Timestamp or Avatar placeholder */}
          <div className="flex items-center gap-2 min-w-[50px]">
            {isAuthor ? (
              // For self messages, show timestamp on the right (due to flex-row-reverse)
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="text-center text-sm leading-[22px] text-muted-foreground opacity-0 hover:underline group-hover:opacity-100">
                  {format(new Date(createdAt), 'HH:mm')}
                </button>
              </Hint>
            ) : (
              // For other messages, show timestamp on the left
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="text-center text-sm leading-[22px] text-muted-foreground opacity-0 hover:underline group-hover:opacity-100">
                  {format(new Date(createdAt), 'HH:mm')}
                </button>
              </Hint>
            )}
          </div>

          {/* Message Content */}
          <div className={cn("flex-1 min-w-0", isAuthor && "flex flex-col items-end")}>
            <div className={cn("relative group/message", isAuthor && "flex justify-end")}>
              <div
                className={cn(
                  "max-w-md rounded-lg px-3 py-2 text-sm cursor-pointer",
                  isAuthor
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
                onContextMenu={handleContextMenu}
              >
                {isEditing ? (
                  <Editor
                    onSubmit={handleUpdate}
                    disabled={isPending}
                    defaultValue={JSON.parse(body)}
                    onCancel={() => setEditingId(null)}
                    variant="update"
                  />
                ) : (
                  <div className={cn(
                    isAuthor && "text-white [&_.ql-editor]:text-white [&_.ql-editor_*]:text-white [&_p]:text-white [&_span]:text-white [&_div]:text-white [&_strong]:text-white [&_em]:text-white [&_u]:text-white [&_s]:text-white [&_a]:text-white [&_li]:text-white [&_ol]:text-white [&_ul]:text-white [&_blockquote]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white"
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

              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
              />
            </div>
          </div>


        </div>

        {/* Custom Context Menu for Compact Layout */}
        {contextMenu.show && (
          <div
            className="context-menu fixed bg-white border rounded-lg shadow-lg py-1 z-[9999] min-w-[160px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2",
                isSelected && "bg-blue-50 text-blue-600"
              )}
              onClick={() => handleContextMenuAction('select')}
            >
              {isSelected ? '✓ Selected' : 'Select Message'}
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => handleContextMenuAction('copy')}
            >
              Copy Message
            </button>
            <hr className="my-1" />
            <button
              className="w-full px-3 py-2 text-left text-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 font-medium"
              onClick={() => handleContextMenuAction('addToTask')}
            >
              <Plus className="h-4 w-4" />
              Add as Task
            </button>
            <hr className="my-1" />
            {isAuthor && (
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handleContextMenuAction('edit')}
              >
                Edit
              </button>
            )}
            {isAuthor && (
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive"
                onClick={() => handleContextMenuAction('delete')}
              >
                Delete
              </button>
            )}
            {!hideThreadButton && (
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handleContextMenuAction('reply')}
              >
                Reply in Thread
              </button>
            )}
          </div>
        )}

        {/* Task Creation Modal for Compact Layout */}
        {showTaskModal && (
          <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Create Task from Message
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                  />
                </div>
                <div>
                  <Label htmlFor="task-content">Task Description</Label>
                  <Textarea
                    id="task-content"
                    value={taskContent}
                    onChange={(e) => setTaskContent(e.target.value)}
                    placeholder="Task description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />

      <div
        className={cn(
          'group relative flex items-start gap-3 p-3 hover:bg-gray-100/60 transition-standard hover:shadow-sm rounded-[10px]',
          isEditing && 'bg-secondary/20 hover:bg-secondary/20',
          isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-standard',
          isSelected && 'bg-secondary/10 hover:bg-secondary/10',
          isAuthor && 'flex-row-reverse'
        )}
        onContextMenu={handleContextMenu}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <button onClick={() => onOpenProfile(memberId)}>
            <Avatar>
              <AvatarImage alt={authorName} src={authorImage} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
        </div>

        {/* Message Content */}
        <div className={cn("flex-1 min-w-0", isAuthor && "flex flex-col items-end")}>
          {/* Author and timestamp */}
          <div className={cn(
            "flex items-baseline gap-2 mb-1",
            isAuthor && "flex-row-reverse"
          )}>
            <button
              onClick={() => onOpenProfile(memberId)}
              className="font-medium text-sm hover:underline transition-all duration-200"
            >
              {authorName}
            </button>
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground hover:underline transition-all duration-200">
                {format(new Date(createdAt), 'h:mm a')}
              </button>
            </Hint>
          </div>

          {/* Message bubble */}
          <div className={cn("relative group/message", isAuthor && "flex justify-end")}>
            <div
              className={cn(
                "max-w-md rounded-lg px-3 py-2 text-sm cursor-pointer",
                isAuthor
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
              onContextMenu={handleContextMenu}
            >
              {isEditing ? (
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              ) : (
                <div className={cn(
                  isAuthor && "text-white [&_.ql-editor]:text-white [&_.ql-editor_*]:text-white [&_p]:text-white [&_span]:text-white [&_div]:text-white [&_strong]:text-white [&_em]:text-white [&_u]:text-white [&_s]:text-white [&_a]:text-white [&_li]:text-white [&_ol]:text-white [&_ul]:text-white [&_blockquote]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white"
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

            <Reactions data={reactions} onChange={handleReaction} />
            <ThreadBar
              count={threadCount}
              image={threadImage}
              name={threadName}
              timestamp={threadTimestamp}
              onClick={() => onOpenMessage(id)}
            />
          </div>
        </div>


      </div>
      {/* Custom Context Menu */}
      {contextMenu.show && (
        <div
          className="context-menu fixed bg-white border rounded-lg shadow-lg py-1 z-[9999] min-w-[160px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={cn(
              "w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2",
              isSelected && "bg-blue-50 text-blue-600"
            )}
            onClick={() => handleContextMenuAction('select')}
          >
            {isSelected ? '✓ Selected' : 'Select Message'}
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => handleContextMenuAction('copy')}
          >
            Copy Message
          </button>
          <hr className="my-1" />
          <button
            className="w-full px-3 py-2 text-left text-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 font-medium"
            onClick={() => handleContextMenuAction('addToTask')}
          >
            <Plus className="h-4 w-4" />
            Add as Task
          </button>
          <hr className="my-1" />
          {isAuthor && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => handleContextMenuAction('edit')}
            >
              Edit
            </button>
          )}
          {isAuthor && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive"
              onClick={() => handleContextMenuAction('delete')}
            >
              Delete
            </button>
          )}
          {!hideThreadButton && (
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => handleContextMenuAction('reply')}
            >
              Reply in Thread
            </button>
          )}
        </div>
      )}

      {/* Task Creation Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Create Task from Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title..."
              />
            </div>
            <div>
              <Label htmlFor="task-content">Task Description</Label>
              <Textarea
                id="task-content"
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
                placeholder="Task description..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
