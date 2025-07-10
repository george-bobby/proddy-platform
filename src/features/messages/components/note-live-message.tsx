"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface NoteLiveMessageProps {
  data: {
    type: "note-live";
    noteId: string;
    noteTitle: string;
    participants?: string[];
  };
}

export const NoteLiveMessage = ({ data }: NoteLiveMessageProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [participantNames, setParticipantNames] = useState<string[]>([]);

  // Get members from the database to display real names
  const members = useQuery(api.members.get, { workspaceId });

  // Update participant names when members data is available
  useEffect(() => {
    if (members && data.participants) {
      const memberMap = new Map();
      members.forEach(member => {
        memberMap.set(member.user._id, member.user.name);
      });

      const names = data.participants.map(id =>
        memberMap.get(id) || "Unknown user"
      );

      setParticipantNames(names);
    }
  }, [members, data.participants]);

  const handleJoinNote = () => {
    if (!workspaceId || !channelId) return;

    // Navigate to the notes page with the specific note ID
    const url = `/workspace/${workspaceId}/channel/${channelId}/notes?noteId=${data.noteId}&t=${Date.now()}`;
    router.push(url);
  };

  return (
    <Card className="w-full max-w-lg bg-white shadow-md border-l-4 border-l-primary" data-message-component="true">
      <div className="flex items-center justify-between p-4 min-h-[64px]">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-gray-900 truncate">
              Live Note: {data.noteTitle}
            </CardTitle>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <Users className="h-3 w-3 mr-1 flex-shrink-0" />
              {participantNames.length > 0 ? (
                <span className="truncate">
                  {participantNames.join(", ")} {participantNames.length === 1 ? "is" : "are"} currently editing
                </span>
              ) : (
                <span>Note session in progress</span>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={handleJoinNote}
          variant="default"
          size="sm"
          className="ml-3 flex-shrink-0 bg-primary text-white hover:bg-primary/80"
        >
          Join Note
        </Button>
      </div>
    </Card>
  );
};
