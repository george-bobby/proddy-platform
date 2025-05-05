import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export const useGetMentionedMessages = (includeRead?: boolean) => {
  const workspaceId = useWorkspaceId();

  const data = useQuery(api.mentions.getMentionsForCurrentUser, { 
    workspaceId,
    includeRead
  });

  const isLoading = data === undefined;

  return { data, isLoading };
};
