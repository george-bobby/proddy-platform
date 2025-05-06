"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMutation as useLiveblocksMutation } from "@/../liveblocks.config";

interface SaveCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fileName: string) => void;
}

export const SaveCanvasDialog = ({
  open,
  onOpenChange,
  onSave,
}: SaveCanvasDialogProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [fileName, setFileName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Convex mutation for creating a message
  const createMessage = useMutation(api.messages.create);

  const handleClose = () => {
    setFileName("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fileName.trim()) {
      toast.error("Please enter a file name");
      return;
    }

    try {
      setIsSaving(true);

      // Call the onSave callback with the file name
      onSave(fileName);

      // Close the dialog
      handleClose();

    } catch (error) {
      console.error("Error saving canvas:", error);
      toast.error("Failed to save canvas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Canvas</DialogTitle>
          <DialogDescription>
            Enter a name for your canvas. It will be saved and shared in the channel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isSaving}
            required
            autoFocus
            placeholder="Canvas name"
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !fileName.trim()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
