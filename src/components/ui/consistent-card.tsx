'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const ConsistentCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-[10px] border bg-card text-card-foreground shadow-md hover:shadow-lg transition-standard', className)}
      {...props}
    />
  )
);
ConsistentCard.displayName = 'ConsistentCard';

const ConsistentCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
ConsistentCardHeader.displayName = 'ConsistentCardHeader';

const ConsistentCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
ConsistentCardTitle.displayName = 'ConsistentCardTitle';

const ConsistentCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
ConsistentCardDescription.displayName = 'ConsistentCardDescription';

const ConsistentCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
ConsistentCardContent.displayName = 'ConsistentCardContent';

const ConsistentCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
ConsistentCardFooter.displayName = 'ConsistentCardFooter';

export { 
  ConsistentCard, 
  ConsistentCardHeader, 
  ConsistentCardFooter, 
  ConsistentCardTitle, 
  ConsistentCardDescription, 
  ConsistentCardContent 
};
