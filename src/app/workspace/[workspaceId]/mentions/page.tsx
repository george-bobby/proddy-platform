'use client';

import { AtSign, Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceHeader } from '../toolbar';

export default function MentionsPage() {
  const workspaceId = useWorkspaceId();

  // Empty state - no mentions yet
  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <AtSign className="mr-2 size-5" />
          <span className="truncate">Mentions</span>
        </Button>
      </WorkspaceHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full w-full flex-col items-center justify-center gap-y-2 bg-white">
          <AtSign className="size-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Mentions</h2>
          <p className="text-sm text-muted-foreground">No mentions yet.</p>
        </div>
      </div>
    </div>
  );
}
