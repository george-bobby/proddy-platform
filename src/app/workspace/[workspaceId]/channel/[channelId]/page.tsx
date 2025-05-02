'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

const ChannelIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  useEffect(() => {
    // Redirect to the chat subdirectory
    router.replace(`/workspace/${workspaceId}/channel/${channelId}/chat`);
  }, [router, workspaceId, channelId]);

  // Show a loading indicator while redirecting
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <Loader className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
};

export default ChannelIdPage;
