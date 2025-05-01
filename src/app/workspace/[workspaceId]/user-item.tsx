import Link from 'next/link';

import type { Id } from '@/../convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useGetMember } from '@/features/members/api/use-get-member';
import { useGetUserStatus } from '@/features/status/api/use-get-user-status';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

interface UserItemProps {
  id: Id<'members'>;
  label?: string;
  image?: string;
  isActive?: boolean;
}

export const UserItem = ({ id, label = 'Member', image, isActive = false }: UserItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();

  // Get the member data to access the userId
  const { data: member } = useGetMember({ id });

  // Get the user's status, passing userId only if available
  const { data: userStatus } = useGetUserStatus({
    workspaceId,
    userId: member?.userId || null,
  });

  // Default to offline if status data is not available
  const status = userStatus?.status || 'offline';

  return (
    <Button
      variant="ghost"
      className={cn(
        "group py-2.5 flex items-center gap-3 justify-start font-medium h-10 px-4 text-sm overflow-hidden rounded-[10px] transition-standard",
        isActive
          ? "text-primary-foreground bg-primary-foreground/20 hover:bg-primary-foreground/30 shadow-sm"
          : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:translate-x-1"
      )}
      size="sm"
      asChild>
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <div className="relative mr-3">
          <Avatar className="size-7 transition-transform duration-200 group-hover:scale-110">
            <AvatarImage alt={label} src={image} />
            <AvatarFallback className="text-xs font-medium bg-primary/20 text-primary-foreground">{avatarFallback}</AvatarFallback>
          </Avatar>
          {member && <StatusIndicator status={status as 'online' | 'offline'} />}
        </div>
        <span className="truncate text-sm">{label}</span>
      </Link>
    </Button>
  );
};
