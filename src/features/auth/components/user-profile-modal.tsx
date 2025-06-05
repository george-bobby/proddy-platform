'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Camera,
  Edit3,
  Save,
  X
} from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationSettings } from '@/features/preferences/components/notification-settings';
import { StatusTrackingSettings } from '@/features/preferences/components/status-tracking-settings';
import { useUpdateUser } from '@/features/auth/api/use-update-user';
import { useCurrentUser } from '../api/use-current-user';

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
  const { data: currentUser } = useCurrentUser();
  const { updateUser } = useUpdateUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const [displayName, setDisplayName] = useState(name);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when user data loads
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.name || '');
      setBio((currentUser as any).bio || '');
      setLocation((currentUser as any).location || '');
      setWebsite((currentUser as any).website || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Track changes
  useEffect(() => {
    if (currentUser) {
      const hasNameChange = displayName !== (currentUser.name || '');
      const hasBioChange = bio !== ((currentUser as any).bio || '');
      const hasLocationChange = location !== ((currentUser as any).location || '');
      const hasWebsiteChange = website !== ((currentUser as any).website || '');
      const hasPhoneChange = phone !== (currentUser.phone || '');

      setHasChanges(hasNameChange || hasBioChange || hasLocationChange || hasWebsiteChange || hasPhoneChange);
    }
  }, [displayName, bio, location, website, phone, currentUser]);

  const avatarFallback = displayName?.charAt(0).toUpperCase() ?? '?';
  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Account Settings' : displayName || 'Your Profile';

  const memberSince = currentUser?._creationTime
    ? new Date(currentUser._creationTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
    : 'Unknown';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEditMode || !hasChanges || !currentUser) return;

    setIsUpdating(true);
    try {
      await updateUser({
        name: displayName.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setDisplayName(currentUser.name || '');
      setBio((currentUser as any).bio || '');
      setLocation((currentUser as any).location || '');
      setWebsite((currentUser as any).website || '');
      setPhone(currentUser.phone || '');
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleAvatarChange = () => {
    // TODO: Implement avatar upload functionality
    toast.info('Avatar upload coming soon!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <div className="flex h-full overflow-hidden">
          {/* Left Panel - Profile Overview */}
          <div className="w-80 bg-gradient-to-b from-primary/5 to-primary/10 p-6 border-r flex-shrink-0">
            <div className="flex flex-col items-center text-center h-full">
              {/* Top Section - Avatar and Basic Info */}
              <div className="space-y-4 flex-shrink-0">
                <div className="relative">
                  <Avatar className="size-24 ring-4 ring-background shadow-lg">
                    <AvatarImage src={image || currentUser?.image} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full size-8 p-0"
                      onClick={handleAvatarChange}
                    >
                      <Camera className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{displayName || currentUser?.name || 'Unknown User'}</h2>
                  <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  <Badge variant="secondary" className="text-xs">
                    Member since {memberSince}
                  </Badge>

                  {isEditMode && !isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-2 mt-3"
                    >
                      <Edit3 className="size-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Middle Section - Bio and Contact Info */}
              <div className="flex-1 flex flex-col justify-center space-y-4 w-full min-h-0">
                {bio && (
                  <p className="text-sm text-muted-foreground italic max-w-full break-words">
                    "{bio}"
                  </p>
                )}

                <div className="space-y-2 w-full">
                  {location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 flex-shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="size-4 flex-shrink-0" />
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {website}
                      </a>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4 flex-shrink-0" />
                      <span className="truncate">{phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="flex-1 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
              <DialogTitle className="text-2xl font-semibold">
                {isEditMode ? 'Account Settings' : 'Profile'}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              {isEditMode ? (
                <div className="h-full flex flex-col">
                  <Tabs defaultValue="profile" className="w-full h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 mx-6 mt-4 flex-shrink-0">
                      <TabsTrigger value="profile" className="gap-2">
                        <User className="size-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="gap-2">
                        <Mail className="size-4" />
                        Notifications
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="flex-1 overflow-y-auto" data-state="active">
                      <div className="p-6 space-y-6">
                        {isEditing ? (
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <User className="size-5" />
                                  Personal Information
                                </CardTitle>
                                <CardDescription>
                                  Update your personal details and profile information
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Display Name *</Label>
                                    <Input
                                      id="name"
                                      value={displayName}
                                      onChange={(e) => setDisplayName(e.target.value)}
                                      disabled={isUpdating}
                                      required
                                      placeholder="Enter your display name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                      id="email"
                                      value={currentUser?.email || ''}
                                      disabled
                                      readOnly
                                      className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Email cannot be changed
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="bio">Bio</Label>
                                  <Input
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    disabled={isUpdating}
                                    placeholder="Tell us about yourself..."
                                    maxLength={160}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {bio.length}/160 characters
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                      id="location"
                                      value={location}
                                      onChange={(e) => setLocation(e.target.value)}
                                      disabled={isUpdating}
                                      placeholder="City, Country"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                      id="website"
                                      value={website}
                                      onChange={(e) => setWebsite(e.target.value)}
                                      disabled={isUpdating}
                                      placeholder="https://yourwebsite.com"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="phone">Phone Number</Label>
                                  <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={isUpdating}
                                    placeholder="+1 (555) 123-4567"
                                  />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                                <CardDescription>
                                  Control your privacy and status visibility
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <StatusTrackingSettings />
                              </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isUpdating}
                                className="gap-2"
                              >
                                <X className="size-4" />
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isUpdating || !hasChanges}
                                className="gap-2"
                              >
                                <Save className="size-4" />
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                  Your personal details and contact information
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Display Name
                                    </Label>
                                    <p className="text-sm font-medium">
                                      {currentUser?.name || 'Not set'}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">
                                      Email Address
                                    </Label>
                                    <p className="text-sm font-medium">
                                      {currentUser?.email || 'Not set'}
                                    </p>
                                  </div>
                                </div>

                                {((currentUser as any)?.bio || (currentUser as any)?.location || (currentUser as any)?.website || currentUser?.phone) && (
                                  <>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-6">
                                      {(currentUser as any)?.bio && (
                                        <div className="col-span-2">
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Bio
                                          </Label>
                                          <p className="text-sm">{(currentUser as any).bio}</p>
                                        </div>
                                      )}
                                      {(currentUser as any)?.location && (
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Location
                                          </Label>
                                          <p className="text-sm">{(currentUser as any).location}</p>
                                        </div>
                                      )}
                                      {(currentUser as any)?.website && (
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Website
                                          </Label>
                                          <a
                                            href={(currentUser as any).website.startsWith('http') ? (currentUser as any).website : `https://${(currentUser as any).website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                          >
                                            {(currentUser as any).website}
                                          </a>
                                        </div>
                                      )}
                                      {currentUser?.phone && (
                                        <div>
                                          <Label className="text-sm font-medium text-muted-foreground">
                                            Phone
                                          </Label>
                                          <p className="text-sm">{currentUser.phone}</p>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Privacy Settings</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <StatusTrackingSettings />
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="flex-1 overflow-y-auto" data-state="inactive">
                      <div className="p-6">
                        <NotificationSettings />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="p-6 h-full overflow-y-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                          <Mail className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                          {currentUser?.email ? (
                            <a
                              href={`mailto:${currentUser.email}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {currentUser.email}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">No email available</p>
                          )}
                        </div>
                      </div>

                      {currentUser?.phone && (
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                            <Phone className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                            <p className="text-sm font-medium">{currentUser.phone}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
