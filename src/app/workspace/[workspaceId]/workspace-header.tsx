'use client';

import { ChevronDown, ListFilter, SquarePen, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa';

import { Doc } from '@/../convex/_generated/dataModel';
import { Hint } from '@/components/hint';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal';
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

import { InviteModal } from './invite-modal';
import { PreferencesModal } from './preferences-modal';

interface WorkspaceHeaderProps {
  workspace: Doc<'workspaces'>;
  isAdmin: boolean;
}

export const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeaderProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useCreateWorkspaceModal();
  const { data: workspaces } = useGetWorkspaces();

  const onWorkspaceClick = (id: string) => {
    setOpen(false);
    router.push(`/workspace/${id}`);
  };

  return (
    <>
      <PreferencesModal open={preferencesOpen} setOpen={setPreferencesOpen} initialValue={workspace.name} />
      <InviteModal open={inviteOpen} setOpen={setInviteOpen} name={workspace.name} joinCode={workspace.joinCode} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start px-2 text-lg font-semibold text-white" size="sm">
            <span className="truncate">Switch Workspace - </span>
            <span className="truncate">{workspace.name}</span>
            <RefreshCw className="ml-2 size-4" />
            <FaChevronDown className="ml-1 size-2.5" />
          </Button>
        </DialogTrigger>

        <DialogContent className="overflow-hidden bg-gray-50 p-0">
          <DialogHeader className="border-b bg-white p-4">
            <DialogTitle>Workspaces</DialogTitle>
            <DialogDescription>Select a workspace to switch to.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-y-2 p-4">
            {workspaces?.map((item) => (
              <button
                key={item._id}
                onClick={() => onWorkspaceClick(item._id)}
                className="flex w-full cursor-pointer items-center gap-x-2 rounded-lg border bg-white px-5 py-4 hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#5E2C5F] text-white">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-sm font-semibold">{item.name}</p>
                </div>
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                className="flex w-full cursor-pointer items-center gap-x-2 rounded-lg border bg-white px-5 py-4 hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#5E2C5F] text-white">
                  <Plus className="size-4" />
                </div>
                <p className="text-sm font-semibold">Create Workspace</p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex h-[49px] items-center justify-between gap-0.5 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="transparent" className="w-auto overflow-hidden p-1.5 text-lg font-semibold" size="sm">
              <span className="truncate">{workspace.name}</span>
              <ChevronDown className="ml-1 size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="start" className="w-64">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="relative mr-2 flex size-9 items-center justify-center overflow-hidden rounded-md bg-[#616061] text-xl font-semibold text-white">
                {workspace.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col items-start">
                <p className="font-bold">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">Active workspace</p>
              </div>
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => setInviteOpen(true)}>
                  Invite people to {workspace.name}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => setPreferencesOpen(true)}>
                  Preferences
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-0.5">
          <Hint label="Filter conversations" side="bottom">
            <Button variant="transparent" size="iconSm">
              <ListFilter className="size-4" />
            </Button>
          </Hint>

          <Hint label="New message" side="bottom">
            <Button variant="transparent" size="iconSm">
              <SquarePen className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
};
