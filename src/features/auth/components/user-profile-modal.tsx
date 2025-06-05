'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from '@/features/preferences/components/notification-settings';
import { StatusTrackingSettings } from '@/features/preferences/components/status-tracking-settings';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name?: string;
  email?: string;
  image?: string;
  mode: 'view' | 'edit';
}

export const UserProfileModal = ({
  open,
  onOpenChange,
  name = '',
  email = '',
  image,
  mode
}: UserProfileModalProps) => {
  const [displayName, setDisplayName] = useState(name);
  const [isUpdating, setIsUpdating] = useState(false);

  const avatarFallback = name?.charAt(0).toUpperCase() ?? '?';
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Account Settings' : 'Your Profile';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEditMode) return;

    // This is a placeholder for actual update functionality
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditMode ? (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center p-4">
                  <Avatar className="size-32">
                    <AvatarImage src={image} />
                    <AvatarFallback className="text-2xl">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 text-sm"
                    disabled={isUpdating}
                  >
                    Change avatar
                  </Button>
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isUpdating}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <Separator />

                {/* Status Tracking Settings */}
                <div className="p-4">
                  <StatusTrackingSettings />
                </div>

                <Separator />
                <div className="flex justify-end p-4">
                  <Button
                    type="submit"
                    disabled={isUpdating || displayName === name}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center p-4">
              <Avatar className="size-32">
                <AvatarImage src={image} />
                <AvatarFallback className="text-2xl">{avatarFallback}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col p-4">
              <p className="text-xl font-bold">{name}</p>
            </div>

            <Separator />

            <div className="flex flex-col p-4">
              <p className="mb-4 text-sm font-bold">Contact information</p>

              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>

                <div className="flex flex-col">
                  <p className="text-[13px] font-semibold text-muted-foreground">Email Address</p>
                  {email ? (
                    <a href={`mailto:${email}`} className="text-sm text-[#1264a3] hover:underline">
                      {email}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No email available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
