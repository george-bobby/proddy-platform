"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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

  // Check if the image data is a data URL (starts with data:)
  const isDataUrl = data.imageData?.startsWith('data:');

  return (
    <Card className="w-full max-w-lg bg-white shadow-md" data-message-component="true">
      <div className="flex items-center justify-between p-4 min-h-[64px]">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <PaintBucket className="h-5 w-5 text-indigo-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-gray-900 truncate">
              Canvas Export: {data.canvasName}
            </CardTitle>
            <div className="text-xs text-gray-600 mt-1">
              {data.exportFormat.toUpperCase()} • {new Date(data.exportTime).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCanvas}
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};
