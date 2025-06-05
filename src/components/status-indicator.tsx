'use client';

import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'recently_online' | 'privacy';
  className?: string;
}

export const StatusIndicator = ({ status, className }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500'; // Green - currently online
      case 'offline':
        return 'bg-red-500'; // Red - offline
      case 'recently_online':
        return 'bg-gray-400'; // Grey - recently online
      case 'privacy':
        return 'bg-white border-gray-300'; // White - status tracking disabled
      default:
        return 'bg-red-500'; // Default to offline
    }
  };

  return (
    <div
      className={cn(
        'absolute bottom-0 right-0 size-2.5 rounded-full border-2',
        status === 'privacy' ? 'border-gray-300' : 'border-white',
        getStatusColor(),
        className
      )}
    />
  );
};
