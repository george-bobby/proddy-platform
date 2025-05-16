"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit, Hash, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCreateChannel } from "@/features/channels/api/use-create-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Id, Doc } from "@/../convex/_generated/dataModel";

interface ChannelsManagementProps {
  workspaceId: Id<"workspaces">;
  currentMember: Doc<"members">;
}

export const ChannelsManagement = ({
  workspaceId,
  currentMember,
}: ChannelsManagementProps) => {
  const { data: channels, isLoading } = useGetChannels({ workspaceId });
  const [newChannelName, setNewChannelName] = useState("");
  const [editChannelName, setEditChannelName] = useState("");
  const [editChannelId, setEditChannelId] = useState<Id<"channels"> | null>(
    null
  );
  const [deleteChannelId, setDeleteChannelId] = useState<Id<"channels"> | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const createChannel = useCreateChannel();
  const updateChannel = useUpdateChannel();
  const removeChannel = useRemoveChannel();

  const handleCreateChannel = async () => {
    if (newChannelName.length < 3 || newChannelName.length > 20) {
      toast.error("Channel name must be between 3 and 20 characters");
      return;
    }

    setIsCreating(true);

    try {
      await createChannel.mutate({
        name: newChannelName,
        workspaceId,
      });

      toast.success("Channel created");
      setNewChannelName("");
      setCreateDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create channel");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateChannel = async () => {
    if (!editChannelId) return;

    if (editChannelName.length < 3 || editChannelName.length > 20) {
      toast.error("Channel name must be between 3 and 20 characters");
      return;
    }

    setIsUpdating(true);

    try {
      await updateChannel.mutate({
        id: editChannelId,
        name: editChannelName,
      });

      toast.success("Channel updated");
      setEditChannelName("");
      setEditChannelId(null);
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update channel");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannelId) return;

    setIsDeleting(true);

    try {
      await removeChannel.mutate({
        id: deleteChannelId,
      });

      toast.success("Channel deleted");
      setDeleteChannelId(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete channel");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (channel: Doc<"channels">) => {
    setEditChannelId(channel._id);
    setEditChannelName(channel.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (channelId: Id<"channels">) => {
    setDeleteChannelId(channelId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Channels</h3>
          <p className="text-sm text-muted-foreground">
            Manage the channels in your workspace
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
              <DialogDescription>
                Add a new channel to your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Channel Name</Label>
                <Input
                  id="name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. marketing"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateChannel} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Channel"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !channels || channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Hash className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No channels</h3>
          <p className="text-sm text-muted-foreground">
            Create a channel to get started
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.map((channel) => (
              <TableRow key={channel._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                    {channel.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(channel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(channel._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Channel Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>Update the channel name</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Channel Name</Label>
              <Input
                id="edit-name"
                value={editChannelName}
                onChange={(e) => setEditChannelName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateChannel} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Channel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Channel Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              channel and all of its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
