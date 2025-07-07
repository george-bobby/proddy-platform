'use client';

import { type LucideIcon } from 'lucide-react';

import Link from 'next/link';

import type { Id } from '@/../convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PresenceIndicator } from '@/features/presence/components/presence-indicator';
import { Hint } from '@/components/hint';
import { useGetMember } from '@/features/members/api/use-get-member';
import { useUserPresence } from '@/features/presence/hooks/use-workspace-presence';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

// SidebarItem Component
interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  id: string;
  href?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export const SidebarItem = ({
  label,
  icon: Icon,
  id,
  href,
  isActive,
  isCollapsed = false,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();

  const content = (
    <div
      className={cn(
        'group flex w-full cursor-pointer items-center gap-x-2 md:gap-x-3 rounded-[10px] px-2 md:px-4 py-2 md:py-2.5 text-sm font-medium transition-standard',
        isActive
          ? 'bg-secondary-foreground/20 text-secondary-foreground shadow-sm hover:bg-secondary-foreground/30'
          : 'text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:translate-x-1',
        isCollapsed && 'justify-center px-1 md:px-2'
      )}
    >
      {isCollapsed ? (
        <div className="relative flex-shrink-0">
          <Hint label={label} side="right" align="center">
            <Icon className="size-4 md:size-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          </Hint>
        </div>
      ) : (
        <>
          <Icon className="size-4 md:size-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="truncate min-w-0">{label}</span>
        </>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  // For channels, use the channel ID
  if (id.startsWith('channels/')) {
    const channelId = id.replace('channels/', '');
    return <Link href={`/workspace/${workspaceId}/channel/${channelId}/chats`}>{content}</Link>;
  }

  return content;
};

// MemberItem Component
interface MemberItemProps {
  id: Id<'members'>;
  label?: string;
  image?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export const MemberItem = ({ id, label = 'Member', image, isActive = false, isCollapsed = false }: MemberItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();

  // Get the member data to access the userId
  const { data: member } = useGetMember({ id });

  // Get the user's presence status using the new presence system
  const { isOnline } = useUserPresence(member?.userId);

  return (
    <Button
      variant="ghost"
      className={cn(
        "group py-2 md:py-2.5 flex items-center gap-2 md:gap-3 font-medium h-9 md:h-10 text-sm overflow-hidden rounded-[10px] transition-standard w-full",
        isActive
          ? "text-secondary-foreground bg-secondary-foreground/20 hover:bg-secondary-foreground/30 shadow-sm"
          : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:translate-x-1",
        isCollapsed ? "justify-center px-1 md:px-2" : "justify-start px-2 md:px-4"
      )}
      size="sm"
      asChild>
      <Link href={`/workspace/${workspaceId}/member/${id}`} className="w-full overflow-hidden">
        {isCollapsed ? (
          <div className="relative flex-shrink-0">
            <Hint label={label} side="right" align="center">
              <div className="relative">
                <Avatar className="size-6 md:size-7 transition-transform duration-200 group-hover:scale-110">
                  <AvatarImage alt={label} src={image} />
                  <AvatarFallback className="text-xs font-medium bg-secondary/20 text-secondary-foreground">{avatarFallback}</AvatarFallback>
                </Avatar>
                {member && <PresenceIndicator isOnline={isOnline} className="w-2 h-2 md:w-2.5 md:h-2.5" />}
              </div>
            </Hint>
          </div>
        ) : (
          <>
            <div className="relative mr-2 md:mr-3 flex-shrink-0">
              <Avatar className="size-6 md:size-7 transition-transform duration-200 group-hover:scale-110">
                <AvatarImage alt={label} src={image} />
                <AvatarFallback className="text-xs font-medium bg-secondary/20 text-secondary-foreground">{avatarFallback}</AvatarFallback>
              </Avatar>
              {member && <PresenceIndicator isOnline={isOnline} className="w-2 h-2 md:w-2.5 md:h-2.5" />}
            </div>
            <span className="truncate min-w-0 text-sm flex-1">{label}</span>
          </>
        )}
      </Link>
    </Button>
  );
};

// ChannelItem Component
interface ChannelItemProps {
  id: Id<'channels'>;
  label: string;
  icon?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export const ChannelItem = ({ id, label, icon, isActive = false, isCollapsed = false }: ChannelItemProps) => {
  const workspaceId = useWorkspaceId();
  const channelFallback = label.charAt(0).toLowerCase();

  return (
    <Button
      variant="ghost"
      className={cn(
        "group py-2 md:py-2.5 flex items-center gap-2 md:gap-3 font-medium h-9 md:h-10 text-sm overflow-hidden rounded-[10px] transition-standard w-full",
        isActive
          ? "text-secondary-foreground bg-secondary-foreground/20 hover:bg-secondary-foreground/30 shadow-sm"
          : "text-secondary-foreground/80 hover:bg-secondary-foreground/10 hover:translate-x-1",
        isCollapsed ? "justify-center px-1 md:px-2" : "justify-start px-2 md:px-4"
      )}
      size="sm"
      asChild>
      <Link href={`/workspace/${workspaceId}/channel/${id}/chats`} className="w-full overflow-hidden">
        {isCollapsed ? (
          <div className="relative flex-shrink-0">
            <Hint label={label} side="right" align="center">
              <div className="relative">
                <div className="flex h-6 md:h-7 w-6 md:w-7 items-center justify-center rounded-full bg-gray-100 transition-transform duration-200 group-hover:scale-110">
                  {icon ? (
                    <span className="text-base">{icon}</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-600">{channelFallback}</span>
                  )}
                </div>
              </div>
            </Hint>
          </div>
        ) : (
          <>
            <div className="relative mr-2 md:mr-3 flex-shrink-0">
              <div className="flex h-6 md:h-7 w-6 md:w-7 items-center justify-center rounded-full bg-gray-100 transition-transform duration-200 group-hover:scale-110">
                {icon ? (
                  <span className="text-base">{icon}</span>
                ) : (
                  <span className="text-xs font-medium text-gray-600">{channelFallback}</span>
                )}
              </div>
            </div>
            <span className="truncate min-w-0 text-sm flex-1">{label}</span>
          </>
        )}
      </Link>
    </Button>
  );
};
