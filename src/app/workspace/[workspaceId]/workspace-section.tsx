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
    <div className="mt-4 flex flex-col px-4">
      <div className="group flex items-center px-2 mb-2">
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0 text-primary-foreground/80 rounded-[8px] transition-standard hover:bg-primary-foreground/10"
        >
          <ChevronDown className={cn('size-4 transition-transform duration-200', !on && '-rotate-90')} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 items-center justify-start overflow-hidden px-2 text-sm font-semibold tracking-tight text-primary-foreground/90 transition-standard"
        >
          <span className="truncate">{label}</span>
        </Button>

        {onNew && (
          <Hint label={hint} side="top" align="center">
            <Button
              onClick={onNew}
              variant="ghost"
              size="sm"
              className="ml-auto h-7 w-7 shrink-0 p-0 text-primary-foreground/80 opacity-0 transition-all group-hover:opacity-100 rounded-[8px] hover:bg-primary-foreground/10"
            >
              <PlusIcon className="size-4 transition-transform duration-200 hover:scale-110" />
            </Button>
          </Hint>
        )}
      </div>

      {on && <div className="mt-2 space-y-1.5">{children}</div>}
    </div>
  );
};
