'use client';

import {useAuthActions} from '@convex-dev/auth/react';
import {AlertTriangle, Loader, LogOut, Settings, Trash2} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
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
import {UserProfileModal} from './user-profile-modal';
import {useDeleteAccount} from '../api/use-delete-account';
import {useCurrentUser} from '../api/use-current-user';
import {useMarkOfflineGlobally} from '@/features/status/api/use-mark-offline-globally';

interface UserButtonProps {
    forceOpenSettings?: boolean;
    defaultTab?: 'profile' | 'notifications';
    onSettingsClose?: () => void;
}

export const UserButton = ({
                               forceOpenSettings = false,
                               defaultTab = 'profile',
                               onSettingsClose
                           }: UserButtonProps = {}) => {
    const router = useRouter();
    const {signOut} = useAuthActions();
    const {data, isLoading} = useCurrentUser();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteAccount = useDeleteAccount();
    const {markOfflineGlobally} = useMarkOfflineGlobally();

    // Handle external control for opening settings modal
    useEffect(() => {
        if (forceOpenSettings) {
            setSettingsOpen(true);
        }
    }, [forceOpenSettings]);

    // Handle settings modal close
    const handleSettingsClose = (open: boolean) => {
        setSettingsOpen(open);
        if (!open && onSettingsClose) {
            onSettingsClose();
        }
    };

    if (isLoading) {
        return <Loader className="size-4 animate-spin text-muted-foreground"/>;
    }

    if (!data) {
        return null;
    }

    const {image, name, email} = data;
    const avatarFallback = name?.charAt(0).toUpperCase();

    const handleSignOut = async () => {
        try {
            // Mark user as offline across all workspaces before signing out
            await markOfflineGlobally();
        } catch (error) {
            console.error('Failed to mark user offline:', error);
            // Continue with logout even if marking offline fails
        }

        await signOut();
        router.replace('/'); // Redirect to homepage after logout
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            // Mark user as offline before deleting account
            try {
                await markOfflineGlobally();
            } catch (error) {
                console.error('Failed to mark user offline:', error);
                // Continue with account deletion even if marking offline fails
            }

            await deleteAccount();
            await signOut();
            router.replace('/'); // Redirect to homepage after account deletion
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
                        <AvatarImage alt={name} src={image}/>
                        <AvatarFallback className="text-base">{avatarFallback}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="center" side="bottom" className="w-60">
                    <DropdownMenuItem
                        onClick={() => setSettingsOpen(true)}
                        className="h-10"
                    >
                        <Settings className="mr-2 size-4"/>
                        Account Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator/>

                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="h-10"
                    >
                        <LogOut className="mr-2 size-4"/>
                        Log out
                    </DropdownMenuItem>

                    <DropdownMenuSeparator/>

                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="h-10 text-destructive"
                    >
                        <Trash2 className="mr-2 size-4"/>
                        Delete Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Account Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all
                            associated data.
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="flex items-center gap-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertTriangle className="size-4"/>
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
                                    <Loader className="mr-2 size-4 animate-spin"/>
                                    Deleting...
                                </>
                            ) : (
                                'Delete Account'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Account Settings Modal */}
            {data && (
                <UserProfileModal
                    open={settingsOpen}
                    onOpenChange={handleSettingsClose}
                    name={name}
                    email={email}
                    image={image}
                    mode="edit"
                    defaultTab={defaultTab}
                />
            )}
        </>
    );
};