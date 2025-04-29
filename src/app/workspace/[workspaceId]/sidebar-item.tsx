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
  'flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden',
  {
    variants: {
      variant: {
        default: 'text-[#f9EDFFCC]',
        active: 'text-[#481349] bg-white/90 hover:bg-white/90',
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
      className={`flex w-full cursor-pointer items-center gap-x-2 rounded-md px-2 py-2 text-sm font-medium transition hover:bg-white/10 ${
        variant === 'active' || isActive ? 'bg-white/10 text-white' : 'text-white/70'
      }`}
    >
      <Icon className="size-5" />
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
