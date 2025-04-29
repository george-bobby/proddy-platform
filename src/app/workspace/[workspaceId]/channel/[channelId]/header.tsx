'use client';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Bell, Search, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaChevronDown, FaGithub } from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { useRemoveChannel } from '@/features/channels/api/use-remove-channel';
import { useUpdateChannel } from '@/features/channels/api/use-update-channel';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useChannelId } from '@/hooks/use-channel-id';
import { useConfirm } from '@/hooks/use-confirm';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { links } from '@/config';
import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { UserButton } from '@/features/auth/components/user-button';
import type { Id } from '@/../convex/_generated/dataModel';

interface HeaderProps {
  channelName: string;
}

export const Header = ({ channelName }: HeaderProps) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    'Delete this channel?',
    'You are about to delete this channel and any of its associated messages. This action is irreversible.'
  );

  const [value, setValue] = useState(channelName);
  const [editOpen, setEditOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });
  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
  const { mutate: updateChannel, isPending: isUpdatingChannel } = useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } = useRemoveChannel();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '-').toLowerCase();
    setValue(value);
  };

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== 'admin') return;
    setEditOpen(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success('Channel updated.');
          setEditOpen(false);
        },
        onError: () => {
          toast.error('Failed to update channel.');
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success('Channel deleted');
          router.push(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error('Failed to delete channel.');
        },
      }
    );
  };

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
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={memberLoading}
              variant="ghost"
              className="w-auto overflow-hidden px-2 text-lg font-semibold text-white"
              size="sm"
            >
              <span className="truncate"># {channelName}</span>
              <FaChevronDown className="ml-2 size-2.5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="overflow-hidden bg-gray-50 p-0">
            <DialogHeader className="border-b bg-white p-4">
              <DialogTitle># {channelName}</DialogTitle>
              <VisuallyHidden.Root>
                <DialogDescription>Your channel preferences</DialogDescription>
              </VisuallyHidden.Root>
            </DialogHeader>

            <div className="flex flex-col gap-y-2 px-4 pb-4">
              <Dialog open={editOpen || isUpdatingChannel} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <button
                    disabled={isUpdatingChannel}
                    className="flex w-full cursor-pointer flex-col rounded-lg border bg-white px-5 py-4 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="text-sm font-semibold">Channel name</p>
                      {member?.role === 'admin' && (
                        <p className="text-sm font-semibold text-[#1264A3] hover:underline">Edit</p>
                      )}
                    </div>
                    <p className="text-sm"># {channelName}</p>
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename this channel</DialogTitle>
                    <VisuallyHidden.Root>
                      <DialogDescription>Rename this channel to match your case.</DialogDescription>
                    </VisuallyHidden.Root>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      value={value}
                      disabled={isUpdatingChannel}
                      onChange={handleChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={20}
                      placeholder="e.g. plan-budget"
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={isUpdatingChannel}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={isUpdatingChannel}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {member?.role === 'admin' && (
                <button
                  onClick={handleDelete}
                  disabled={isRemovingChannel}
                  className="flex cursor-pointer items-center gap-x-2 rounded-lg border bg-white px-5 py-4 text-rose-600 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash className="size-4" />
                  <p className="text-sm font-semibold">Delete channel</p>
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
