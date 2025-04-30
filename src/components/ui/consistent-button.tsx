'use client';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const consistentButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg',
        tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 shadow-md hover:shadow-lg',
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        transparent: 'bg-transparent hover:bg-accent/10 text-accent',
        glass: 'bg-white/10 border border-white/20 text-white hover:bg-white/20 shadow-md hover:shadow-lg',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-[10px] px-3',
        lg: 'h-11 rounded-[10px] px-8',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ConsistentButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof consistentButtonVariants> {
  asChild?: boolean;
}

const ConsistentButton = React.forwardRef<HTMLButtonElement, ConsistentButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(consistentButtonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
ConsistentButton.displayName = 'ConsistentButton';

export { ConsistentButton, consistentButtonVariants };
