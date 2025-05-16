import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';

export const useGetLastActiveWorkspace = () => {
  const data = useQuery(api.userPreferences.getLastActiveWorkspace);
  const isLoading = data === undefined;

  return { data, isLoading };
};
