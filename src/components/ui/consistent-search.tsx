'use client';

import { Search } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ConsistentSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchClick?: () => void;
  shortcutKey?: string;
}

const ConsistentSearch = React.forwardRef<HTMLInputElement, ConsistentSearchProps>(
  ({ className, onSearchClick, shortcutKey = 'K', ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex h-9 w-full items-center rounded-[10px] border border-input bg-background px-3 text-sm ring-offset-background transition-standard shadow-sm hover:shadow-md focus-within:shadow-md',
          className
        )}
        onClick={onSearchClick}
      >
        <Search className="mr-2 size-4 text-muted-foreground" />
        <input
          type="text"
          className="flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          ref={ref}
          {...props}
        />
        {shortcutKey && (
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-90">
            <span className="text-xs">⌘</span>{shortcutKey}
          </kbd>
        )}
      </div>
    );
  }
);
ConsistentSearch.displayName = 'ConsistentSearch';

export { ConsistentSearch };
