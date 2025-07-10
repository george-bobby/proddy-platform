"use client";

import {useRouter} from "next/navigation";
import {Card, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {PaintBucket} from "lucide-react";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {useChannelId} from "@/hooks/use-channel-id";

interface CanvasMessageProps {
    data: {
        type: "canvas";
        canvasName: string;
        roomId: string;
        savedCanvasId: string;
    };
}

export const CanvasMessage = ({data}: CanvasMessageProps) => {
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
        <Card data-message-component="true"
              className="w-full max-w-lg bg-white text-gray-900 shadow-md border-l-4 border-l-primary">
            <div className="flex items-center justify-between p-4 min-h-[64px]">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <PaintBucket className="h-5 w-5 text-primary flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-gray-900 truncate">
                            Canvas: {data.canvasName}
                        </CardTitle>

                    </div>
                </div>
                <Button
                    onClick={handleOpenCanvas}
                    variant="default"
                    size="sm"
                    className="ml-3 flex-shrink-0 bg-primary text-white hover:bg-primary/80"
                >
                    Open Canvas
                </Button>
            </div>
        </Card>
    );
};
