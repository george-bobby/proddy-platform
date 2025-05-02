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
import { useWorkspaceSearch } from '@/features/workspaces/store/use-workspace-search';

import { InviteModal } from './invitation';
import { PreferencesModal } from './preferences';

interface WorkspaceHeaderProps {
  workspace: Doc<'workspaces'>;
  isAdmin: boolean;
}

export const WorkspaceHeader = ({ workspace, isAdmin }: WorkspaceHeaderProps) => {
  const router = useRouter();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false); // renamed here
  const [_, setCreateOpen] = useCreateWorkspaceModal();
  const [__, setSearchOpen] = useWorkspaceSearch();
  const { data: workspaces } = useGetWorkspaces();

  const onWorkspaceClick = (id: string) => {
    setSwitchOpen(false); // updated reference
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

      <div className="flex h-16 items-center justify-between gap-1 px-6 border-b border-tertiary/20">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="mt-5 h-14 group flex items-center gap-4 overflow-hidden p-2.5 text-primary-foreground hover:bg-primary-foreground/10 transition-standard"
                size="lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-md transition-standard group-hover:shadow-lg">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold tracking-tight">{workspace.name}</span>
                  <span className="text-xs text-primary-foreground/70">Active Workspace</span>
                </div>
                <ChevronDown className="ml-0.5 size-3.5 shrink-0 opacity-70 transition-transform duration-200 group-hover:rotate-180" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="start" className="w-64 p-2">
              <DropdownMenuItem className="cursor-pointer capitalize rounded-[8px] p-3 mb-1 hover:bg-accent/20">
                <div className="relative mr-3 flex size-10 items-center justify-center overflow-hidden rounded-[10px] bg-primary text-xl font-semibold text-primary-foreground shadow-md">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col items-start">
                  <p className="font-bold tracking-tight">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">Active workspace</p>
                </div>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer py-2.5 flex items-center gap-3 group rounded-[8px] hover:bg-accent/20"
                    onClick={() => setInviteOpen(true)}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-primary/10 transition-standard group-hover:bg-primary/20">
                      <Plus className="size-3.5 text-primary transition-transform duration-200 group-hover:scale-125" />
                    </div>
                    <span className="font-medium">Invite to {workspace.name}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer py-2.5 flex items-center gap-3 group rounded-[8px] hover:bg-accent/20"
                    onClick={() => setPreferencesOpen(true)}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-primary/10 transition-standard group-hover:bg-primary/20">
                      <SquarePen className="size-3.5 text-primary transition-transform duration-200 group-hover:rotate-12" />
                    </div>
                    <span className="font-medium">Preferences</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer py-2.5 flex items-center gap-3 group rounded-[8px] hover:bg-accent/20"
                onClick={() => setSwitchOpen(true)} // updated here
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-primary/10 transition-standard group-hover:bg-primary/20">
                  <RefreshCw className="size-3.5 text-primary transition-transform duration-200 group-hover:rotate-45" />
                </div>
                <span className="font-medium">Switch Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={switchOpen} onOpenChange={setSwitchOpen}> {/* updated here */}
            <DialogContent className="overflow-hidden p-0 rounded-[12px] border-0 shadow-xl">
              <DialogHeader className="border-b p-5 bg-muted/30">
                <DialogTitle className="text-xl font-semibold tracking-tight">Workspaces</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Select a workspace to switch to.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-y-3 p-5">
                {workspaces?.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => onWorkspaceClick(item._id)}
                    className="flex w-full cursor-pointer items-center gap-x-4 rounded-[10px] border bg-card px-4 py-3 hover:bg-accent/10 transition-standard hover:translate-x-1 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-md transition-standard group-hover:shadow-lg">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-semibold tracking-tight">{item.name}</p>
                      {item._id === workspace._id && (
                        <p className="text-xs text-muted-foreground">Current workspace</p>
                      )}
                    </div>
                    {item._id === workspace._id && (
                      <div className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-sm">
                        Active
                      </div>
                    )}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setSwitchOpen(false); // updated here
                    setCreateOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-x-4 rounded-[10px] border border-dashed bg-card/50 px-4 py-3 hover:bg-accent/10 transition-standard hover:translate-x-1 group mt-2"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-md transition-standard group-hover:shadow-lg">
                    <Plus className="size-5 transition-transform duration-200 group-hover:scale-125" />
                  </div>
                  <p className="text-sm font-semibold tracking-tight">Create New Workspace</p>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <Hint label="New message" side="bottom">
            <Button
              onClick={() => setSearchOpen(true)}
              variant="ghost"
              size="sm"
              className="flex h-10 w-10 items-center justify-center rounded-[10px] p-0 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-standard"
            >
              <SquarePen className="size-5" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
};
