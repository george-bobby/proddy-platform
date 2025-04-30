import { type VariantProps, cva } from 'class-variance-authority';
import Link from 'next/link';

import type { Id } from '@/../convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { cn } from '@/lib/utils';

const userItemVariants = cva(
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

interface UserItemProps {
  id: Id<'members'>;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>['variant'];
}

export const UserItem = ({ id, label = 'Member', image, variant }: UserItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();

  return (
    <Button variant="ghost" className={cn(userItemVariants({ variant }), "group")} size="sm" asChild>
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="mr-1.5 size-5 transition-transform duration-200 group-hover:scale-110">
          <AvatarImage alt={label} src={image} />
          <AvatarFallback className="text-xs bg-primary/20 text-primary-foreground">{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm">{label}</span>
      </Link>
    </Button>
  );
};
