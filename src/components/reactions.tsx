import { MdOutlineAddReaction } from 'react-icons/md';

import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

import type { Doc, Id } from '../../convex/_generated/dataModel';
import { EmojiPopover } from './emoji-popover';
import { Hint } from './hint';

interface ReactionsProps {
  data: Array<
    Omit<Doc<'reactions'>, 'memberId'> & {
      count: number;
      memberIds: Id<'members'>[];
    }
  >;
  onChange: (value: string) => void;
}

export const Reactions = ({ data, onChange }: ReactionsProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  const currentMemberId = currentMember?._id;

  if (data.length === 0 || !currentMemberId) return null;

  return (
    <div className="my-1 flex items-center gap-1">
      {data.map((reaction) => (
        <Hint
          key={reaction._id}
          label={`${reaction.count} ${reaction.count === 1 ? 'person' : 'people'} reacted with ${reaction.value}`}
        >
          <button
            onClick={() => onChange(reaction.value)}
            className={cn(
              'flex h-6 items-center gap-x-1 rounded-full border border-transparent bg-slate-200/70 px-2 text-slate-800 transition-standard hover:bg-slate-200/90 hover:scale-105',
              reaction.memberIds.includes(currentMemberId) &&
              'border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20'
            )}
          >
            {reaction.value}{' '}
            <span
              className={cn(
                'text-xs font-semibold text-muted-foreground',
                reaction.memberIds.includes(currentMemberId) && 'text-secondary'
              )}
            >
              {reaction.count}
            </span>
          </button>
        </Hint>
      ))}

      <EmojiPopover hint="Add a reaction" onEmojiSelect={onChange}>
        <button className="group flex h-7 items-center gap-x-1 rounded-full border border-transparent bg-slate-200/70 px-3 text-slate-800 hover:border-secondary transition-standard hover:bg-slate-200/90 hover:scale-105">
          <MdOutlineAddReaction className="size-4 transition-transform duration-200 group-hover:rotate-12" />
        </button>
      </EmojiPopover>
    </div>
  );
};
