'use client';

import { type VariantProps, cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { IconType } from 'react-icons/lib';

import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

const sidebarItemVariants = cva(
  'flex items-center gap-3 justify-start font-medium h-10 px-4 text-sm overflow-hidden rounded-[10px] transition-standard',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1',
        active: 'text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  id: string;
  href?: string;
  isActive?: boolean;
}

export const SidebarItem = ({
  label,
  icon: Icon,
  id,
  href,
  isActive,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();

  const content = (
    <div
      className={cn(
        'group flex w-full cursor-pointer items-center gap-x-3 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-standard',
        isActive
          ? 'bg-primary-foreground/20 text-primary-foreground shadow-sm hover:bg-primary-foreground/30'
          : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1'
      )}
    >
      <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" />
      <span className="truncate">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  // For channels, use the channel ID
  if (id.startsWith('channels/')) {
    const channelId = id.replace('channels/', '');
    return <Link href={`/workspace/${workspaceId}/channel/${channelId}`}>{content}</Link>;
  }

  return content;
};
