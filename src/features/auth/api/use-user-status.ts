import { useMutation, useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

/**
 * Hook to manage user active status
 */
export const useUserStatus = () => {
  const setActive = useMutation(api.userStatus.setActive);
  const setInactive = useMutation(api.userStatus.setInactive);
  const initializeUser = useMutation(api.userStatus.initializeUser);

  return {
    setActive,
    setInactive,
    initializeUser,
  };
};

/**
 * Hook to get a user's active status
 */
export const useUserActiveStatus = (userId?: Id<'users'>) => {
  const status = useQuery(api.userStatus.getStatus, userId ? { userId } : {});
  const isActive = status === 'yes';

  return {
    status,
    isActive,
  };
};

/**
 * Hook to get all active users
 */
export const useActiveUsers = () => {
  const users = useQuery(api.userStatus.getActiveUsers);

  return {
    users,
    isLoading: users === undefined,
  };
};
