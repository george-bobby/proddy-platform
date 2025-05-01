import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetUserStatusProps {
  workspaceId: Id<'workspaces'>;
  userId?: Id<'users'> | null;
}

export const useGetUserStatus = ({ workspaceId, userId }: UseGetUserStatusProps) => {
  // Pass the userId only if it exists
  const args = {
    workspaceId,
    ...(userId ? { userId } : {})
  };

  const data = useQuery(api.status.getUserStatus, args);
  const isLoading = data === undefined;

  return { data, isLoading };
};
