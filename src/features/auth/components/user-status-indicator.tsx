'use client';

import { cn } from '@/lib/utils';
import type { Id } from '@/../convex/_generated/dataModel';
import { useUserActiveStatus } from '../api/use-user-status';

interface UserStatusIndicatorProps {
  userId?: Id<'users'>;
  className?: string;
}

export const UserStatusIndicator = ({ userId, className }: UserStatusIndicatorProps) => {
  const { isActive } = useUserActiveStatus(userId);

  return (
    <div
      className={cn(
        'h-2.5 w-2.5 rounded-full',
        isActive ? 'bg-green-500' : 'bg-red-500',
        className
      )}
      title={isActive ? 'Online' : 'Offline'}
    />
  );
};
