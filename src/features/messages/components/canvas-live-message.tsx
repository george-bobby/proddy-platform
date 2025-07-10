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
    <Card className="w-full max-w-lg !bg-white shadow-md border-l-4 border-l-primary" data-message-component="true">
      <div className="flex items-center justify-between p-4 min-h-[64px]">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <PaintBucket className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-gray-900 truncate">
              Live Canvas Session
            </CardTitle>
            <div className="flex items-center text-xs text-gray-600 mt-1">
              <Users className="h-3 w-3 mr-1 flex-shrink-0" />
              {participantNames.length > 0 ? (
                <span className="truncate">
                  {participantNames.join(", ")} {participantNames.length === 1 ? "is" : "are"} currently drawing
                </span>
              ) : (
                <span>Canvas session in progress</span>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={handleJoinCanvas}
          variant="default"
          size="sm"
          className="ml-3 flex-shrink-0 bg-primary text-white hover:bg-primary/80"
        >
          Join Canvas
        </Button>
      </div>
    </Card>
  );
};
