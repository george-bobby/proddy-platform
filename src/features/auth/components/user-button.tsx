'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { Loader, LogOut, User, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteAccount } from '../api/use-delete-account';
import { useCurrentUser } from '../api/use-current-user';
import { useUserStatus } from '../api/use-user-status';

export const UserButton = () => {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAccount = useDeleteAccount();
  const { setActive, setInactive, initializeUser } = useUserStatus();

  // Initialize user status and set user as active when component mounts
  useEffect(() => {
    if (data) {
      // Initialize user status first, then set as active
      initializeUser().then(() => setActive());
    }

    // Set user as inactive when they leave the page or close the browser
    return () => {
      if (data) {
        setInactive();
      }
    };
  }, [data, setActive, setInactive, initializeUser]);

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data) {
    return null;
  }

  const { image, name } = data;
  const avatarFallback = name?.charAt(0).toUpperCase();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      // Set user as inactive before deleting account
      await setInactive();
      await deleteAccount();
      await signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="relative outline-none">
          <Avatar className="size-10 transition hover:opacity-75">
            <AvatarImage alt={name} src={image} />
            <AvatarFallback className="text-base">{avatarFallback}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" side="bottom" className="w-60">
          <DropdownMenuItem className="h-10">
            <User className="mr-2 size-4" />
            View Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="h-10">
            <Settings className="mr-2 size-4" />
            Account Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={async () => {
              // Set user as inactive before signing out
              await setInactive();
              await signOut();
              router.replace('/auth');
            }}
            className="h-10"
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="h-10 text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all
              associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            <p>Warning: This will delete all your workspaces, channels, and messages.</p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
