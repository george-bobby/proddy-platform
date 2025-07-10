"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, File } from "lucide-react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useChannelId } from "@/hooks/use-channel-id";
import { useState } from "react";
import { toast } from "sonner";

interface NoteExportMessageProps {
  data: {
    type: "note-export";
    noteId: string;
    noteTitle: string;
    exportFormat: "pdf" | "markdown" | "html" | "json";
    exportTime: string;
    exportData?: string;
    fileSize?: string;
  };
}

export const NoteExportMessage = ({ data }: NoteExportMessageProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle opening the original note
  const handleOpenNote = () => {
    if (!workspaceId || !channelId) return;

    // Navigate to the notes page with the specific note ID
    const url = `/workspace/${workspaceId}/channel/${channelId}/notes?noteId=${data.noteId}&t=${Date.now()}`;
    router.push(url);
  };

  // Handle downloading the exported note
  const handleDownload = () => {
    try {
      setIsDownloading(true);

      if (!data.exportData) {
        toast.error("Export data not found");
        return;
      }

      // Create a download link
      const a = document.createElement("a");
      
      if (data.exportFormat === "pdf" || data.exportData.startsWith('data:')) {
        // Handle data URLs (like PDF or base64 encoded files)
        a.href = data.exportData;
      } else {
        // Handle text-based exports (markdown, html, json)
        const blob = new Blob([data.exportData], { 
          type: getContentType(data.exportFormat) 
        });
        const url = URL.createObjectURL(blob);
        a.href = url;
      }
      
      a.download = `${data.noteTitle || "note"}.${data.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up object URL if created
      if (!data.exportData.startsWith('data:')) {
        URL.revokeObjectURL(a.href);
      }

      toast.success(`Note downloaded as ${data.exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Error downloading note:", error);
      toast.error("Failed to download note");
    } finally {
      setIsDownloading(false);
    }
  };

  const getContentType = (format: string) => {
    switch (format) {
      case "markdown": return "text/markdown";
      case "html": return "text/html";
      case "json": return "application/json";
      case "pdf": return "application/pdf";
      default: return "text/plain";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf": return <File className="h-4 w-4 text-red-500" />;
      case "markdown": return <FileText className="h-4 w-4 text-blue-500" />;
      case "html": return <FileText className="h-4 w-4 text-orange-500" />;
      case "json": return <FileText className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full max-w-lg bg-white shadow-md" data-message-component="true">
      <div className="flex items-center justify-between p-4 min-h-[64px]">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-gray-900 truncate">
              Note Export: {data.noteTitle}
            </CardTitle>
            <div className="flex items-center text-xs text-gray-600 mt-1 space-x-2">
              {getFormatIcon(data.exportFormat)}
              <span className="uppercase font-medium">{data.exportFormat}</span>
              {data.fileSize && (
                <>
                  <span>•</span>
                  <span>{data.fileSize}</span>
                </>
              )}
              <span>•</span>
              <span>{new Date(data.exportTime).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenNote}
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};
