'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ConsistentInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const ConsistentInput = React.forwardRef<HTMLInputElement, ConsistentInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-standard shadow-sm focus:shadow-md hover:border-primary/30',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ConsistentInput.displayName = 'ConsistentInput';

export { ConsistentInput };
