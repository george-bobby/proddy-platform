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
  'flex items-center gap-2 justify-start font-normal h-8 px-3 text-sm overflow-hidden rounded-md transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1',
        active: 'text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 shadow-inner',
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
        'group flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200',
        variant === 'active' || isActive
          ? 'bg-primary-foreground/20 text-primary-foreground shadow-inner hover:bg-primary-foreground/30'
          : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1'
      )}
    >
      <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
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
