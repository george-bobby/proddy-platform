"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  RefreshCw,
  Save,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InviteModal } from "@/app/workspace/[workspaceId]/invitation";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
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
import type { Doc } from "@/../convex/_generated/dataModel";

interface WorkspaceManagementProps {
  workspace: Doc<"workspaces">;
  currentMember: Doc<"members">;
}

export const WorkspaceManagement = ({
  workspace,
  currentMember,
}: WorkspaceManagementProps) => {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const updateWorkspace = useUpdateWorkspace();
  const removeWorkspace = useRemoveWorkspace();
  const newJoinCode = useNewJoinCode();

  const isOwner = currentMember.role === "owner";

  const handleUpdateName = async () => {
    if (name.length < 3 || name.length > 20) {
      toast.error("Workspace name must be between 3 and 20 characters");
      return;
    }

    setIsUpdating(true);

    try {
      await updateWorkspace.mutate({
        id: workspace._id,
        name,
      });

      toast.success("Workspace name updated");
    } catch (error) {
      toast.error("Failed to update workspace name");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateNewCode = async () => {
    setIsGeneratingCode(true);

    try {
      await newJoinCode.mutate({
        workspaceId: workspace._id,
      });

      toast.success("New join code generated");
    } catch (error) {
      toast.error("Failed to generate new join code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyJoinCode = () => {
    const joinLink = `${window.location.origin}/join/${workspace._id}?code=${workspace.joinCode}`;
    navigator.clipboard.writeText(joinLink);
    toast.success("Join link copied to clipboard");
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);

    try {
      await removeWorkspace.mutate({
        id: workspace._id,
      });

      toast.success("Workspace deleted");
      router.push("/workspace");
    } catch (error) {
      toast.error("Failed to delete workspace");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <InviteModal
        open={inviteOpen}
        setOpen={setInviteOpen}
        name={workspace.name}
        joinCode={workspace.joinCode}
      />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Workspace Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your workspace name and other settings
          </p>
        </div>

        <Separator />

        <div className="flex justify-between items-start">
          {/* Left side - Edit name */}
          <div className="grid gap-2 w-1/2 pr-4">
            <Label htmlFor="name">Workspace Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUpdateName} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right side - Delete option */}
          {isOwner && (
            <div className="w-1/2 pl-4">
              <div className="grid gap-2">
                <Label className="text-destructive">Delete Workspace</Label>
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Workspace
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your workspace and remove all associated data
                          including messages, channels, and member information.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteWorkspace}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
