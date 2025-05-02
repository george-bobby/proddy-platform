'use client';

import {
  AlertTriangle,
  CalendarIcon,
  ChevronDown,
  HashIcon,
  Loader,
  MessageSquareText,
  PlusIcon,
  SendHorizonal
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useToggle } from 'react-use';

import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useChannelId } from '@/hooks/use-channel-id';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

import { WorkspaceHeader } from './header';
import { SidebarItem, UserItem } from './options';

// DroppableItem Component
interface DroppableItemProps {
  label: string;
  hint: string;
  onNew?: () => void;
  children: React.ReactNode;
}

const DroppableItem = ({
  children,
  hint,
  label,
  onNew,
}: DroppableItemProps) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className="mt-4 flex flex-col px-4">
      <div className="group flex items-center px-2 mb-2">
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0 text-primary-foreground/80 rounded-[8px] transition-standard hover:bg-primary-foreground/10"
        >
          <ChevronDown className={cn('size-4 transition-transform duration-200', !on && '-rotate-90')} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 items-center justify-start overflow-hidden px-2 text-sm font-semibold tracking-tight text-primary-foreground/90 transition-standard"
        >
          <span className="truncate">{label}</span>
        </Button>

        {onNew && (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant="ghost"
              size="sm"
              className="ml-auto h-7 w-7 shrink-0 p-0 text-primary-foreground/80 opacity-0 transition-all group-hover:opacity-100 rounded-[8px] hover:bg-primary-foreground/10"
            >
              <PlusIcon className="size-4 transition-transform duration-200 hover:scale-110" />
            </Button>
          </Hint>
        )}
      </div>

      {on && <div className="mt-2 space-y-1.5">{children}</div>}
    </div>
  );
};



// WorkspaceSidebar Component
export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const memberId = useMemberId();
  const pathname = usePathname();

  const [_open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });
  const { data: members, isLoading: membersLoading } = useGetMembers({ workspaceId });

  if (memberLoading || workspaceLoading || channelsLoading || membersLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-tertiary">
        <Loader className="size-6 animate-spin text-primary-foreground animate-pulse-subtle" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-y-3 bg-tertiary">
        <AlertTriangle className="size-6 text-primary-foreground animate-pulse-subtle" />
        <p className="text-sm font-medium text-primary-foreground animate-fade-in">Workspace not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-2 bg-tertiary transition-standard">
      <WorkspaceHeader workspace={workspace} isAdmin={member.role === 'admin'} />

      <div className="mt-4 flex flex-col gap-2 px-4">
        <SidebarItem
          label="Calendar"
          icon={CalendarIcon}
          id="calendar"
          href={`/workspace/${workspaceId}/calendar`}
          isActive={pathname.includes('/calendar')}
        />
        <SidebarItem
          label="Threads"
          icon={MessageSquareText}
          id="threads"
          href={`/workspace/${workspaceId}/threads`}
          isActive={pathname.includes('/threads')}
        />
        <SidebarItem
          label="Outbox"
          icon={SendHorizonal}
          id="outbox"
          href={`/workspace/${workspaceId}/outbox`}
          isActive={pathname.includes('/outbox')}
        />
      </div>

      {channels && channels.length > 0 && (
        <DroppableItem
          label="Channels"
          hint="New Channel"
          onNew={member.role === 'admin' ? () => setOpen(true) : undefined}
        >
          {channels.map((item) => (
            <SidebarItem
              isActive={channelId === item._id}
              key={item._id}
              id={`channels/${item._id}`}
              icon={HashIcon}
              label={item.name}
            />
          ))}
        </DroppableItem>
      )}

      {members && members.length > 0 && (
        <DroppableItem
          label="Members"
          hint="New Direct Message"
          onNew={member.role === 'admin' ? () => { } : undefined}
        >
          {members.map((item) => (
            <UserItem
              key={item._id}
              id={item._id}
              label={item.user.name}
              image={item.user.image}
              isActive={item._id === memberId}
            />
          ))}
        </DroppableItem>
      )}
    </div>
  );
};