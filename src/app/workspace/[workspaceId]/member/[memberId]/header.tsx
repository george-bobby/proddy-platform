'use client';

import { Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaChevronDown, FaGithub } from 'react-icons/fa';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { links } from '@/config';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { UserButton } from '@/features/auth/components/user-button';
import type { Id } from '@/../convex/_generated/dataModel';

interface HeaderProps {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

export const Header = ({ memberName = 'Member', memberImage, onClick }: HeaderProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const avatarFallback = memberName.charAt(0).toUpperCase();

  const onChannelClick = (channelId: Id<'channels'>) => {
    setSearchOpen(false);
    router.push(`/workspace/${workspaceId}/channel/${channelId}`);
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
  }, []);

  return (
    <nav className="flex h-[49px] items-center overflow-hidden border-b bg-[#481349]">
      <div className="flex items-center px-4">
        <Button
          variant="ghost"
          className="w-auto overflow-hidden px-2 text-lg font-semibold text-white"
          size="sm"
          onClick={onClick}
        >
          <Avatar className="mr-2 size-6">
            <AvatarImage src={memberImage} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>

          <span className="truncate">{memberName}</span>
          <FaChevronDown className="ml-2 size-2.5" />
        </Button>
      </div>

      <div className="min-w-[280px] max-w-[642px] shrink grow-[2] px-2">
        <Button
          onClick={() => setSearchOpen(true)}
          size="sm"
          className="h-7 w-full justify-start bg-accent/25 px-2 hover:bg-accent/25"
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

      <div className="ml-auto flex flex-1 items-center justify-end gap-x-2 px-4">
        <Button variant="transparent" size="iconSm" asChild>
          <Link
            href={links.sourceCode}
            target="_blank"
            rel="noreferrer noopener"
            title="Source Code"
          >
            <FaGithub className="size-5 text-white" />
          </Link>
        </Button>
        <Button variant="ghost" size="iconSm" className="text-white">
          <Bell className="size-5" />
        </Button>
        <UserButton />
      </div>
    </nav>
  );
};
