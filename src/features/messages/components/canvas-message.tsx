"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaintBucket } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";

interface CanvasMessageProps {
  data: {
    type: "canvas";
    canvasName: string;
    roomId: string;
    savedCanvasId: string;
  };
}

export const CanvasMessage = ({ data }: CanvasMessageProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const handleOpenCanvas = () => {
    if (!workspaceId || !channelId) return;

    // Navigate to the saved canvas using the saved room ID and canvas name
    // Use router.push for client-side navigation without page reload
    const url = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${data.roomId}&canvasName=${encodeURIComponent(data.canvasName)}&t=${Date.now()}`;
    router.push(url);
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <PaintBucket className="h-4 w-4 mr-2" />
          Canvas: {data.canvasName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-24 bg-slate-50 rounded-md flex items-center justify-center border">
          <PaintBucket className="h-8 w-8 text-slate-300" />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleOpenCanvas}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Open Canvas
        </Button>
      </CardFooter>
    </Card>
  );
};
