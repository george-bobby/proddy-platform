'use client';

import { useEffect } from 'react';
import { useUserStatus } from '../api/use-user-status';
import { useCurrentUser } from '../api/use-current-user';

/**
 * Hook to initialize user status when they log in
 * This should be used in a component that's rendered on all authenticated pages
 */
export const useInitializeUserStatus = () => {
  const { data: user } = useCurrentUser();
  const { setActive } = useUserStatus();

  useEffect(() => {
    if (user) {
      // Set user as active when they log in
      setActive();
    }
  }, [user, setActive]);
};
