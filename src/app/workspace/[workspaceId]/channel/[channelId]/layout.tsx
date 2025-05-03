'use client';

import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { FaChevronDown } from 'react-icons/fa';
import { Loader, Trash, TriangleAlert } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { useGetChannel } from '@/features/channels/api/use-get-channel';
import { useUpdateChannel } from '@/features/channels/api/use-update-channel';
import { useRemoveChannel } from '@/features/channels/api/use-remove-channel';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useConfirm } from '@/hooks/use-confirm';
import { WorkspaceToolbar } from '../../toolbar';
import Topbar from './topbar';

const ChannelLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });
  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this channel?",
    "You are about to delete this channel and any of its associated messages. This action is irreversible.",
  );

  const [value, setValue] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);

  const { mutate: updateChannel, isPending: isUpdatingChannel } = useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } = useRemoveChannel();

  // Set the initial value when channel data is loaded
  if (channel && value === '') {
    setValue(channel.name);
  }

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
          toast.success("Channel updated.");
          setEditOpen(false);
        },
        onError: () => {
          toast.error("Failed to update channel.");
        },
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Channel deleted");
          router.push(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error("Failed to delete channel.");
        },
      },
    );
  };

  if (channelLoading || memberLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-2">
        <TriangleAlert className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found.</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ConfirmDialog />

      <WorkspaceToolbar>
        <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
              size="sm"
            >
              <span className="truncate"># {channel.name}</span>
              <FaChevronDown className="ml-2 size-2.5 transition-transform duration-200 group-hover:rotate-180" />
            </Button>
          </DialogTrigger>

          <DialogContent className="overflow-hidden bg-gray-50 p-0">
            <DialogHeader className="border-b bg-white p-4">
              <DialogTitle># {channel.name}</DialogTitle>

              <VisuallyHidden.Root>
                <DialogDescription>Your channel preferences</DialogDescription>
              </VisuallyHidden.Root>
            </DialogHeader>

            <div className="flex flex-col gap-y-2 px-4 pb-4 pt-4">
              <Dialog open={editOpen || isUpdatingChannel} onOpenChange={handleEditOpen}>
                <DialogTrigger asChild>
                  <button
                    disabled={isUpdatingChannel || member?.role !== 'admin'}
                    className="flex w-full cursor-pointer flex-col rounded-lg border bg-white px-5 py-4 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="text-sm font-semibold">Channel name</p>
                      {member?.role === 'admin' && <p className="text-sm font-semibold text-[#1264A3] hover:underline">Edit</p>}
                    </div>

                    <p className="text-sm"># {channel.name}</p>
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

                      <Button disabled={isUpdatingChannel} type="submit">Save</Button>
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
      </WorkspaceToolbar>

      <Topbar />

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default ChannelLayout;
