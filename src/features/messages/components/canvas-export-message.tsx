"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, PaintBucket } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useState } from "react";
import { toast } from "sonner";

interface CanvasExportMessageProps {
  data: {
    type: "canvas-export";
    canvasName: string;
    roomId: string;
    exportedCanvasId: string;
    exportFormat: "png" | "svg" | "json";
    exportTime: string;
    imageData?: string;
    jsonData?: any;
  };
}

export const CanvasExportMessage = ({ data }: CanvasExportMessageProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle opening the original canvas
  const handleOpenCanvas = () => {
    if (!workspaceId || !channelId) return;

    // Navigate to the saved canvas using the saved room ID and canvas name
    const url = `/workspace/${workspaceId}/channel/${channelId}/canvas?roomId=${data.roomId}&canvasName=${encodeURIComponent(data.canvasName)}&t=${Date.now()}`;
    router.push(url);
  };

  // Handle downloading the exported canvas
  const handleDownload = () => {
    try {
      setIsDownloading(true);

      if (data.exportFormat === "png" || data.exportFormat === "svg") {
        if (!data.imageData) {
          toast.error("Image data not found");
          return;
        }

        // Create a download link
        const a = document.createElement("a");
        a.href = data.imageData;
        a.download = `${data.canvasName || "canvas"}.${data.exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } 
      else if (data.exportFormat === "json") {
        if (!data.jsonData) {
          toast.error("JSON data not found");
          return;
        }

        // Create a JSON blob
        const jsonString = JSON.stringify(data.jsonData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.canvasName || "canvas"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success(`Canvas downloaded as ${data.exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Error downloading canvas:", error);
      toast.error("Failed to download canvas");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <PaintBucket className="h-4 w-4 mr-2 text-indigo-500" />
          Canvas Export: {data.canvasName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {data.imageData && (data.exportFormat === "png" || data.exportFormat === "svg") && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img 
              src={data.imageData} 
              alt={data.canvasName} 
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {data.exportFormat === "json" && (
          <div className="text-xs text-muted-foreground">
            JSON data export - {new Date(data.exportTime).toLocaleString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={handleOpenCanvas}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open Canvas
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};
