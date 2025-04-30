import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetRecentChannelMessagesProps {
  channelId: Id<'channels'> | null | undefined;
  limit?: number;
  enabled?: boolean;
}

export const useGetRecentChannelMessages = ({ channelId, limit = 10, enabled = true }: UseGetRecentChannelMessagesProps) => {
  // Only enable the query if we have a valid channelId and enabled is true
  const shouldEnable = enabled && !!channelId;

  const data = useQuery(api.messages.getRecentChannelMessages, shouldEnable ? { channelId: channelId as Id<'channels'>, limit } : 'skip');

  const isLoading = shouldEnable && data === undefined;

  return { data: data || [], isLoading };
};
