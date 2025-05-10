'use client';

import { Bell, Search, MessageSquare, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Hint } from '@/components/hint';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { MentionsNotificationDialog } from '@/components/mentions-notification-dialog';
import { UserButton } from '@/features/auth/components/user-button';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useWorkspaceSearch } from '@/features/workspaces/store/use-workspace-search';
import { useGetUnreadMentionsCount } from '@/features/messages/api/use-get-unread-mentions-count';

import { useWorkspaceId } from '@/hooks/use-workspace-id';

interface WorkspaceToolbarProps {
  children: ReactNode;
}

export const WorkspaceToolbar = ({
  children
}: WorkspaceToolbarProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [searchOpen, setSearchOpen] = useWorkspaceSearch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });
  const { counts, isLoading: isLoadingMentions } = useGetUnreadMentionsCount();

  const onChannelClick = (channelId: Id<'channels'>) => {
    setSearchOpen(false);
    router.push(`/workspace/${workspaceId}/channel/${channelId}/chats`);
  };

  const onMemberClick = (memberId: Id<'members'>) => {
    setSearchOpen(false);
    router.push(`/workspace/${workspaceId}/member/${memberId}`);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setSearchOpen]);

  return (
    <nav className="flex h-16 items-center overflow-hidden border-b bg-tertiary text-primary-foreground shadow-md">
      {/* Left section - Entity info (Channel/Member/etc) */}
      <div className="flex items-center px-6">
        {children}
      </div>

      {/* Middle section - Search */}
      <div className="min-w-[280px] max-w-[642px] shrink grow-[2] px-4">
        <Button
          onClick={() => setSearchOpen(true)}
          size="sm"
          className="h-9 w-full justify-start bg-white/10 px-3 hover:bg-white/20 transition-standard border border-white/10 rounded-[10px]"
        >
          <Search className="mr-2 size-4 text-white" />
          <span className="text-xs text-white">Search {workspace?.name ?? 'workspace'}...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-90">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder={`Search ${workspace?.name ?? 'workspace'}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Channels">
              {channels?.map((channel) => (
                <CommandItem onSelect={() => onChannelClick(channel._id)} key={channel._id}>
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Members">
              {members?.map((member) => (
                <CommandItem onSelect={() => onMemberClick(member._id)} key={member._id}>
                  {member.user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>

      {/* Right section - Actions */}
      <div className="ml-auto flex flex-1 items-center justify-end gap-x-3 px-6">
        {/* Status Page Button */}
        <Hint label="System Status - View current service status" side="bottom">
          <Button
            variant="ghost"
            size="iconSm"
            className="text-white relative hover:bg-white/15 transition-colors"
            onClick={() => {
              // Open status page in a new tab
              const statusPageUrl = 'https://proddy.betteruptime.com/';
              window.open(statusPageUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            <div className="relative">
              <Activity className="size-5" />
            </div>
          </Button>
        </Hint>

        {/* Notifications Button */}
        <Hint label="Notifications" side="bottom">
          <Button
            variant="ghost"
            size="iconSm"
            className="text-white relative hover:bg-white/15 transition-colors"
            onClick={() => setNotificationsOpen(true)}
          >
            <div className={`relative ${!isLoadingMentions && counts && counts.total > 0 ? 'animate-pulse' : ''}`}>
              <Bell className="size-5" />
              {!isLoadingMentions && counts && counts.total > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 border border-white shadow-sm"
                >
                  {counts.total}
                </Badge>
              )}
            </div>
          </Button>
        </Hint>

        {/* Notification Dialog */}
        <MentionsNotificationDialog
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        />

        <UserButton />
      </div>
    </nav>
  );
};
