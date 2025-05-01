'use client';

import { type VariantProps, cva } from 'class-variance-authority';
import {
  AlertTriangle,
  CalendarIcon,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons/lib';

import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useChannelId } from '@/hooks/use-channel-id';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

// SidebarItem Component
const sidebarItemVariants = cva(
  'flex items-center gap-3 justify-start font-medium h-10 px-4 text-sm overflow-hidden rounded-[10px] transition-standard',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1',
        active: 'text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  id: string;
  href?: string;
  isActive?: boolean;
}

export const SidebarItem = ({
  label,
  icon: Icon,
  id,
  href,
  isActive,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();

  const content = (
    <div
      className={cn(
        'group flex w-full cursor-pointer items-center gap-x-3 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-standard',
        isActive
          ? 'bg-primary-foreground/20 text-primary-foreground shadow-sm hover:bg-primary-foreground/30'
          : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1'
      )}
    >
      <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" />
      <span className="truncate">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  // For channels, use the channel ID
  if (id.startsWith('channels/')) {
    const channelId = id.replace('channels/', '');
    return <Link href={`/workspace/${workspaceId}/channel/${channelId}`}>{content}</Link>;
  }

  return content;
};

// Import the UserItem and WorkspaceSection components
import { UserItem } from './user-item';
import { WorkspaceHeader } from './header';
import { WorkspaceSection } from './options';

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
        <WorkspaceSection
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
        </WorkspaceSection>
      )}

      {members && members.length > 0 && (
        <WorkspaceSection
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
        </WorkspaceSection>
      )}
    </div>
  );
};