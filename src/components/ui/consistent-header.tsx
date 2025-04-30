'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ConsistentHeaderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
}

const ConsistentHeader = React.forwardRef<HTMLElement, ConsistentHeaderProps>(
  ({ className, children, variant = 'primary', ...props }, ref) => {
    const headerVariants = {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      tertiary: 'bg-tertiary text-tertiary-foreground',
      transparent: 'bg-transparent text-foreground',
    };

    return (
      <nav
        ref={ref}
        className={cn(
          'flex h-[49px] items-center overflow-hidden border-b shadow-md',
          headerVariants[variant],
          className
        )}
        {...props}
      >
        {children}
      </nav>
    );
  }
);
ConsistentHeader.displayName = 'ConsistentHeader';

export { ConsistentHeader };
