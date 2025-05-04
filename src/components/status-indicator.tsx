'use client';

import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline';
  className?: string;
}

export const StatusIndicator = ({ status, className }: StatusIndicatorProps) => {
  return (
    <div 
      className={cn(
        'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white',
        status === 'online' ? 'bg-green-500' : 'bg-red-500',
        className
      )}
    />
  );
};
