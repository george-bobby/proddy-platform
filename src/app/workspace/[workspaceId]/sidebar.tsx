'use client';

import {
  AlertTriangle,
  CalendarIcon,
  ChevronDown,
  Loader,
  MessageSquareText,
  PlusIcon,
  SendHorizonal,
  Users,
  AtSign,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
  CheckSquare
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
import { Separator } from '@/components/ui/separator';

import { WorkspaceHeader } from './header';
import { SidebarItem, MemberItem, ChannelItem } from './options';

// DroppableItem Component
interface DroppableItemProps {
  label: string;
  hint: string;
  icon: React.ElementType;
  onNew?: () => void;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

const DroppableItem = ({
  children,
  hint,
  label,
  icon: Icon,
  onNew,
  isCollapsed = false,
}: DroppableItemProps) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className={cn(
      "flex flex-col w-full",
      isCollapsed ? "px-1" : "px-2 md:px-4"
    )}>
      <div
        className="group flex w-full cursor-pointer items-center gap-x-2 md:gap-x-3 rounded-[10px] px-2 md:px-4 py-2.5 text-sm font-medium transition-standard text-primary-foreground/80 hover:bg-primary-foreground/10"
        onClick={toggle}
      >
        {isCollapsed ? (
          <div className="relative flex-shrink-0">
            <Hint label={label} side="right" align="center">
              <Icon className="size-4 md:size-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            </Hint>
          </div>
        ) : (
          <Icon className="size-4 md:size-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
        )}

        {!isCollapsed && (
          <>
            <span className="truncate min-w-0">{label}</span>
            <ChevronDown
              className={cn(
                'ml-auto size-4 flex-shrink-0 transition-transform duration-200',
                !on && '-rotate-90'
              )}
            />

            {onNew && (
              <Hint label={hint} side="top" align="center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNew();
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 flex-shrink-0 p-0 text-primary-foreground/80 opacity-0 transition-all group-hover:opacity-100 rounded-[8px] hover:bg-primary-foreground/10"
                >
                  <PlusIcon className="size-4 transition-transform duration-200 hover:scale-110" />
                </Button>
              </Hint>
            )}
          </>
        )}
      </div>

      {on && <div className="mt-2 space-y-1.5 pl-1 md:pl-2">{children}</div>}
    </div>
  );
};



// WorkspaceSidebar Component
export const WorkspaceSidebar = ({
  isCollapsed,
  setIsCollapsed
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void
}) => {
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
    <div
      className={cn(
        "flex h-full flex-col bg-tertiary transition-all duration-300 ease-in-out border-r-2 border-white",
        isCollapsed ? "w-[70px]" : "w-[280px]"
      )}
    >
      {/* Workspace Header */}
      <div className="flex-shrink-0">
        <WorkspaceHeader workspace={workspace} isAdmin={member.role === 'admin'} isCollapsed={isCollapsed} />
      </div>

      {/* Channels Section */}
      {channels && channels.length > 0 && (
        <div className="mt-4">
          <DroppableItem
            label="Channels"
            hint="New Channel"
            icon={Hash}
            onNew={member.role === 'admin' ? () => setOpen(true) : undefined}
            isCollapsed={isCollapsed}
          >
            {channels.map((item) => (
              <ChannelItem
                key={item._id}
                id={item._id}
                label={item.name}
                icon={item.icon}
                isActive={channelId === item._id}
                isCollapsed={isCollapsed}
              />
            ))}
          </DroppableItem>
        </div>
      )}

      {/* Members Section */}
      {members && members.length > 0 && (
        <div className="mt-2">
          <DroppableItem
            label="Members"
            hint="New Direct Message"
            icon={Users}
            onNew={member.role === 'admin' ? () => { } : undefined}
            isCollapsed={isCollapsed}
          >
            {members.map((item) => (
              <MemberItem
                key={item._id}
                id={item._id}
                label={item.user.name}
                image={item.user.image}
                isActive={item._id === memberId}
                isCollapsed={isCollapsed}
              />
            ))}
          </DroppableItem>
        </div>
      )}

      {/* Divider between dynamic and static sections */}
      <Separator className="my-4 mx-4 bg-primary-foreground/10" />

      {/* Static Items */}
      <div className="flex flex-col gap-2 px-4">
        <SidebarItem
          label="Outbox"
          icon={SendHorizonal}
          id="outbox"
          href={`/workspace/${workspaceId}/outbox`}
          isActive={pathname.includes('/outbox')}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          label="Threads"
          icon={MessageSquareText}
          id="threads"
          href={`/workspace/${workspaceId}/threads`}
          isActive={pathname.includes('/threads')}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          label="Tasks"
          icon={CheckSquare}
          id="tasks"
          href={`/workspace/${workspaceId}/tasks`}
          isActive={pathname.includes('/tasks')}
          isCollapsed={isCollapsed}
        />

        <SidebarItem
          label="Calendar"
          icon={CalendarIcon}
          id="calendar"
          href={`/workspace/${workspaceId}/calendar`}
          isActive={pathname.includes('/calendar')}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Collapse/Expand Button */}
      <div className="mt-auto mb-4 flex justify-center">
        <Hint label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 flex items-center justify-center hover:bg-primary-foreground/10"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4 text-primary-foreground/80" />
            ) : (
              <PanelLeftClose className="size-4 text-primary-foreground/80" />
            )}
          </Button>
        </Hint>
      </div>
    </div>
  );
};