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
    <Card className="w-full max-w-sm bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Note: {data.noteTitle}
        </CardTitle>
      </CardHeader>
      {data.previewContent && (
        <CardContent className="pb-2">
          <div className="text-sm text-muted-foreground line-clamp-3">
            {data.previewContent}
          </div>
        </CardContent>
      )}
      <CardFooter>
        <Button
          onClick={handleOpenNote}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Open Note
        </Button>
      </CardFooter>
    </Card>
  );
};
