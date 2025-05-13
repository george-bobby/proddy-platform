"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaintBucket, Users } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface CanvasLiveMessageProps {
  data: {
    type: "canvas-live";
    roomId: string;
    participants?: string[];
  };
}

export const CanvasLiveMessage = ({ data }: CanvasLiveMessageProps) => {
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

  const handleJoinCanvas = () => {
    if (!workspaceId || !channelId) return;

    // Navigate to the canvas using the specific room ID from the message data
    // Use router.push for client-side navigation without page reload
    // Add the roomId parameter to ensure we join the exact same canvas session
    const url = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${data.roomId}&t=${Date.now()}`;
    router.push(url);
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-md border-l-4 border-l-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <PaintBucket className="h-4 w-4 mr-2 text-secondary" />
          Live Canvas Session
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {participantNames.length > 0 ? (
            <span>
              {participantNames.join(", ")} {participantNames.length === 1 ? "is" : "are"} currently drawing
            </span>
          ) : (
            <span>Canvas session in progress</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleJoinCanvas}
          variant="default"
          size="sm"
          className="w-full"
        >
          Join Canvas
        </Button>
      </CardFooter>
    </Card>
  );
};
