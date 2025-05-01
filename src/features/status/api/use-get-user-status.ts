import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetUserStatusProps {
  workspaceId: Id<'workspaces'>;
  userId: Id<'users'>;
}

export const useGetUserStatus = ({ workspaceId, userId }: UseGetUserStatusProps) => {
  const data = useQuery(api.status.getUserStatus, { workspaceId, userId });
  const isLoading = data === undefined;

  return { data, isLoading };
};
