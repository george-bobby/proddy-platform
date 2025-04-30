import { CheckSquare, MessageSquareText, Pencil, Smile, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMessageSelection } from '@/contexts/message-selection-context';

import { EmojiPopover } from './emoji-popover';
import { Hint } from './hint';

interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  handleThread: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton?: boolean;
  messageId: string; // Added messageId prop for selection
}

export const Toolbar = ({
  isAuthor,
  isPending,
  handleEdit,
  handleDelete,
  handleThread,
  handleReaction,
  hideThreadButton,
  messageId,
}: ToolbarProps) => {
  const { isMessageSelected, toggleMessageSelection } = useMessageSelection();
  const isSelected = isMessageSelected(messageId as any); // Type cast needed because of Id<'messages'>

  return (
    <div className="absolute right-5 top-0">
      <div className="rounded-md border bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        <Hint label={isSelected ? "Deselect message" : "Select message"}>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => toggleMessageSelection(messageId as any)}
            className={isSelected ? "text-blue-500" : ""}
          >
            <CheckSquare className="size-4" />
          </Button>
        </Hint>

        <EmojiPopover hint="Add reaction" onEmojiSelect={handleReaction}>
          <Button variant="ghost" size="iconSm" disabled={isPending}>
            <Smile className="size-4" />
          </Button>
        </EmojiPopover>

        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button onClick={handleThread} variant="ghost" size="iconSm" disabled={isPending}>
              <MessageSquareText className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Edit message">
            <Button onClick={handleEdit} variant="ghost" size="iconSm" disabled={isPending}>
              <Pencil className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Delete message">
            <Button onClick={handleDelete} variant="ghost" size="iconSm" disabled={isPending}>
              <Trash className="size-4" />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  );
};
