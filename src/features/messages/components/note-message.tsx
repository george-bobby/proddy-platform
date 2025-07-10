"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";

interface NoteMessageProps {
  data: {
    type: "note";
    noteId: string;
    noteTitle: string;
    previewContent?: string;
  };
}

export const NoteMessage = ({ data }: NoteMessageProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const handleOpenNote = () => {
    if (!workspaceId || !channelId) return;

    // Navigate to the notes page with the specific note ID
    router.push(`/workspace/${workspaceId}/channel/${channelId}/notes?noteId=${data.noteId}`);
  };

  return (
    <Card data-message-component="true" className="w-full bg-white text-gray-900">
      <div className="flex items-center justify-between p-4 min-h-[100px]">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-gray-900 truncate">
              Note: {data.noteTitle}
            </CardTitle>

          </div>
        </div>
        <Button
          onClick={handleOpenNote}
          variant="default"
          size="sm"
          className="ml-3 flex-shrink-0 bg-primary text-white hover:bg-primary/80"
        >
          Open Note
        </Button>
      </div>
    </Card>
  );
};
