"use client";

import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PaintBucket, Users } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface UnifiedMessageProps {
  data: {
    type:
      | "canvas"
      | "note"
      | "canvas-live"
      | "note-live"
      | "canvas-export"
      | "note-export";
    // Canvas specific
    canvasName?: string;
    roomId?: string;
    savedCanvasId?: string;
    // Note specific
    noteId?: string;
    noteTitle?: string;
    previewContent?: string;
    // Live session specific
    participants?: string[];
    // Export specific
    exportedCanvasId?: string;
    exportFormat?: "png" | "svg" | "json" | "pdf" | "markdown" | "html";
    exportTime?: string;
    imageData?: string;
    jsonData?: any;
    exportData?: string;
    fileSize?: string;
  };
}

export const UnifiedMessage = ({ data }: UnifiedMessageProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [participantNames, setParticipantNames] = useState<string[]>([]);

  // Get members from the database to display real names for live sessions
  const members = useQuery(api.members.get, { workspaceId });

  // Update participant names when members data is available
  useEffect(() => {
    if (members && data.participants) {
      const memberMap = new Map();
      members.forEach((member) => {
        memberMap.set(member.user._id, member.user.name);
      });

      const names = data.participants.map(
        (id) => memberMap.get(id) || "Unknown user"
      );

      setParticipantNames(names);
    }
  }, [members, data.participants]);

  // Determine if this is a canvas or note type
  const isCanvas = data.type.includes("canvas");
  const isLive = data.type.includes("live");
  const isExport = data.type.includes("export");

  // Get the appropriate icon
  const Icon = isCanvas ? PaintBucket : FileText;

  // Get the title
  const getTitle = () => {
    if (isLive) {
      return isCanvas ? "Live Canvas Session" : `Live Note: ${data.noteTitle}`;
    }
    if (isExport) {
      return isCanvas
        ? `Canvas Export: ${data.canvasName}`
        : `Note Export: ${data.noteTitle}`;
    }
    return isCanvas ? data.canvasName : data.noteTitle;
  };

  // Get the button text
  const getButtonText = () => {
    if (isLive) {
      return isCanvas ? "Join Canvas" : "Join Note";
    }
    if (isExport) {
      return isCanvas ? "View Export" : "View Export";
    }
    return isCanvas ? "Open Canvas" : "Open Note";
  };

  // Handle click action
  const handleClick = () => {
    if (!workspaceId || !channelId) return;

    let url = "";

    if (isCanvas) {
      if (isLive) {
        // For live canvas, navigate to canvas with room ID
        url = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${data.roomId}&t=${Date.now()}`;
      } else {
        // For regular canvas, navigate with canvas name and room ID
        url = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${data.roomId}&canvasName=${encodeURIComponent(data.canvasName || "")}&t=${Date.now()}`;
      }
    } else {
      // For notes (live or regular)
      if (isLive) {
        url = `/workspace/${workspaceId}/channel/${channelId}/notes?noteId=${data.noteId}&t=${Date.now()}`;
      } else {
        url = `/workspace/${workspaceId}/channel/${channelId}/notes?noteId=${data.noteId}`;
      }
    }

    router.push(url);
  };

  return (
    <Card
      data-message-component="true"
      className="w-full max-w-lg !bg-white !text-gray-900 shadow-md border-l-4 border-l-primary"
    >
      <div className="flex items-center justify-between p-4 min-h-[64px]">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-gray-900 truncate">
              {getTitle()}
            </CardTitle>

            {/* Show participants for live sessions */}
            {isLive && (
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                {participantNames.length > 0 ? (
                  <span className="truncate">
                    {participantNames.join(", ")}{" "}
                    {participantNames.length === 1 ? "is" : "are"} currently{" "}
                    {isCanvas ? "drawing" : "editing"}
                  </span>
                ) : (
                  <span>
                    {isCanvas ? "Canvas" : "Note"} session in progress
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleClick}
          variant="default"
          size="sm"
          className="ml-3 flex-shrink-0 bg-primary !text-white hover:bg-primary/80"
        >
          {getButtonText()}
        </Button>
      </div>
    </Card>
  );
};
