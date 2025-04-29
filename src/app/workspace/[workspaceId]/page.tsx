'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useGetChannels } from '@/features/channels/api/use-get-channels';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export default function WorkspacePage() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });

  useEffect(() => {
    if (channels?.length) {
      router.push(`/workspace/${workspaceId}/channel/${channels[0]._id}`);
    }
  }, [channels, router, workspaceId]);

  return null;
}
