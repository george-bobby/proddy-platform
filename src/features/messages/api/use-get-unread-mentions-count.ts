import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export const useGetUnreadMentionsCount = () => {
  const workspaceId = useWorkspaceId();

  console.log('useGetUnreadMentionsCount - Called with workspaceId:', workspaceId);

  // Use the direct query instead of the hook
  const result = useQuery(
    api.mentions.getProcessedMentions,
    workspaceId ? {
      workspaceId
    } : "skip"
  );

  console.log('useGetUnreadMentionsCount - Query result:', {
    result,
    isLoading: result === undefined
  });

  // Initialize counts
  const counts = {
    total: 0,
    channel: 0,
    direct: 0,
    thread: 0,
    card: 0
  };

  // Calculate counts by type if we have data
  if (result && result.length > 0) {
    // Filter for unread mentions only
    const unreadMentions = result.filter((mention: any) => !mention.read);
    counts.total = unreadMentions.length;

    unreadMentions.forEach((mention: any) => {
      if (mention.source && mention.source.type) {
        counts[mention.source.type] = (counts[mention.source.type] || 0) + 1;
      }
    });
  }

  console.log('useGetUnreadMentionsCount - Final counts:', counts);

  return {
    counts,
    isLoading: result === undefined
  };
};
