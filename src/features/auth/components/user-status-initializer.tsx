'use client';

import { useInitializeUserStatus } from '../hooks/use-initialize-user-status';

/**
 * Component to initialize user status when they log in
 * This should be included in the layout of all authenticated pages
 */
export const UserStatusInitializer = () => {
  useInitializeUserStatus();
  
  // This component doesn't render anything
  return null;
};
