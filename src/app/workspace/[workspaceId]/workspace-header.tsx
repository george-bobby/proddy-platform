'use client';

import { ChevronDown, ListFilter, Plus, RefreshCw, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Doc } from '@/../convex/_generated/dataModel';
import { Hint } from '@/components/hint';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal';

import { InviteModal } from './invite-modal';
import { PreferencesModal } from './preferences-modal';

interface WorkspaceHeaderProps {
  workspace: Doc<'workspaces'>;
  isAdmin: boolean;
}

export const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeaderProps) => {
  const router = useRouter();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [_, setCreateOpen] = useCreateWorkspaceModal();
  const { data: workspaces } = useGetWorkspaces();

  const onWorkspaceClick = (id: string) => {
    setOpen(false);
    router.push(`/workspace/${id}`);
  };

  return (
    <>
      <PreferencesModal
        open={preferencesOpen}
        setOpen={setPreferencesOpen}
        initialValue={workspace.name}
      />
      <InviteModal
        open={inviteOpen}
        setOpen={setInviteOpen}
        name={workspace.name}
        joinCode={workspace.joinCode}
      />

      <div className="flex h-12 items-center justify-between gap-1 px-4">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="group flex items-center gap-2 overflow-hidden p-1.5 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200"
                size="sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-md transition-standard group-hover:shadow-lg">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{workspace.name}</span>
                  <span className="text-xs text-primary-foreground/70">Active workspace</span>
                </div>
                <ChevronDown className="ml-0.5 size-3.5 shrink-0 opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="start" className="w-64">
              <DropdownMenuItem className="cursor-pointer capitalize">
                <div className="relative mr-2 flex size-9 items-center justify-center overflow-hidden rounded-[10px] bg-primary text-xl font-semibold text-primary-foreground shadow-md">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col items-start">
                  <p className="font-bold">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">Active workspace</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer py-2 flex items-center gap-2 group"
                onClick={() => setOpen(true)}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-primary/10 transition-standard group-hover:bg-primary/20">
                  <RefreshCw className="size-3 text-primary transition-transform duration-200 group-hover:rotate-45" />
                </div>
                <span>Switch workspace</span>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer py-2 flex items-center gap-2 group"
                    onClick={() => setInviteOpen(true)}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-primary/10 transition-standard group-hover:bg-primary/20">
                      <Plus className="size-3 text-primary transition-transform duration-200 group-hover:scale-125" />
                    </div>
                    <span>Invite people to {workspace.name}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer py-2 flex items-center gap-2 group"
                    onClick={() => setPreferencesOpen(true)}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-primary/10 transition-standard group-hover:bg-primary/20">
                      <SquarePen className="size-3 text-primary transition-transform duration-200 group-hover:rotate-12" />
                    </div>
                    <span>Preferences</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0">
              <DialogHeader className="border-b p-4">
                <DialogTitle>Workspaces</DialogTitle>
                <DialogDescription>Select a workspace to switch to.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-y-2 p-4">
                {workspaces?.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => onWorkspaceClick(item._id)}
                    className="flex w-full cursor-pointer items-center gap-x-3 rounded-[10px] border bg-card px-4 py-2.5 hover:bg-accent/10 transition-standard hover-translate-x"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-md transition-standard hover:shadow-lg">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-semibold">{item.name}</p>
                      {item._id === workspace._id && (
                        <p className="text-xs text-muted-foreground">Current workspace</p>
                      )}
                    </div>
                    {item._id === workspace._id && (
                      <div className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shadow-sm">
                        Active
                      </div>
                    )}
                  </button>
                ))}

                {isAdmin && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      setCreateOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-x-3 rounded-[10px] border border-dashed bg-card/50 px-4 py-2.5 hover:bg-accent/10 transition-standard hover-translate-x"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-md transition-standard hover:shadow-lg">
                      <Plus className="size-4 transition-transform duration-200 hover:scale-125" />
                    </div>
                    <p className="text-sm font-semibold">Create New Workspace</p>
                  </button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-1.5">
          <Hint label="Filter conversations" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <ListFilter className="size-4" />
            </Button>
          </Hint>

          <Hint label="New message" side="bottom">
            <Button
              variant="ghost"
              size="sm"
              className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <SquarePen className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
};
