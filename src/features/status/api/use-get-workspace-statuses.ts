import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetWorkspaceStatusesProps {
  workspaceId: Id<'workspaces'>;
}

export const useGetWorkspaceStatuses = ({ workspaceId }: UseGetWorkspaceStatusesProps) => {
  const data = useQuery(api.status.getForWorkspace, { workspaceId });
  const isLoading = data === undefined;

  return { data, isLoading };
};
