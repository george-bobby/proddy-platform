'use client';

import { ChevronDown, PlusIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useToggle } from 'react-use';

import { Hint } from '@/components/hint';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkspaceSectionProps {
  label: string;
  hint: string;
  onNew?: () => void;
}

export const WorkspaceSection = ({
  children,
  hint,
  label,
  onNew,
}: PropsWithChildren<WorkspaceSectionProps>) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className="mt-2 flex flex-col px-2">
      <div className="group flex items-center px-2">
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="h-6 w-6 shrink-0 p-0 text-primary-foreground/80"
        >
          <ChevronDown className={cn('size-4 transition-transform', !on && '-rotate-90')} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 items-center justify-start overflow-hidden px-1 text-sm font-medium text-primary-foreground/80"
        >
          <span className="truncate">{label}</span>
        </Button>

        {onNew && (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant="ghost"
              size="sm"
              className="ml-auto h-6 w-6 shrink-0 p-0 text-primary-foreground/80 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <PlusIcon className="size-4" />
            </Button>
          </Hint>
        )}
      </div>

      {on && <div className="mt-1">{children}</div>}
    </div>
  );
};
