'use client';

import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useChannelId } from '@/hooks/use-channel-id';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { SidebarItem } from './sidebar-item';
import { UserItem } from './user-item';
import { WorkspaceHeader } from './workspace-header';
import { WorkspaceSection } from './workspace-section';

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
              userId={item.userId}
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
