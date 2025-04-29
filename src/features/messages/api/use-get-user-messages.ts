import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export const useGetUserMessages = () => {
  const workspaceId = useWorkspaceId();

  return useQuery(api.messages.getUserMessages, { workspaceId });
};
