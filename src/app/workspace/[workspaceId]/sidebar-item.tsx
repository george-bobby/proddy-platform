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
  'flex items-center gap-2 justify-start font-normal h-8 px-3 text-sm overflow-hidden rounded-md transition-colors',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground/80 hover:bg-primary-foreground/10',
        active: 'text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/20',
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
  variant?: 'default' | 'active';
}

export const SidebarItem = ({
  label,
  icon: Icon,
  id,
  href,
  isActive,
  variant = 'default',
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();

  const content = (
    <div
      className={cn(
        'flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-sm font-medium transition',
        variant === 'active' || isActive
          ? 'bg-primary-foreground/20 text-primary-foreground'
          : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
      )}
    >
      <Icon className="size-4" />
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
