'use client';

import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Share, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { TestNavigation } from '@/app/test/components/test-navigation';

interface TestCanvasHeaderProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  itemCount: number;
}

export const TestCanvasHeader = ({
  zoom,
  onZoomChange,
  itemCount,
}: TestCanvasHeaderProps) => {
  const router = useRouter();

  const handleBackToNotes = () => {
    router.push('/test/notes');
  };

  const handleZoomIn = () => {
    onZoomChange(zoom + 25);
  };

  const handleZoomOut = () => {
    onZoomChange(zoom - 25);
  };

  const handleResetZoom = () => {
    onZoomChange(100);
  };

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation and canvas info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToNotes}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Canvas</h1>
            <Badge variant="secondary" className="text-xs">
              Demo
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-medium">{itemCount}</span>
              <span>item{itemCount !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex items-center gap-1">
              <span>Zoom: {zoom}%</span>
            </div>
          </div>
        </div>

        {/* Right side - Navigation and canvas controls */}
        <div className="flex items-center gap-4">
          <TestNavigation variant="compact" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="text-xs px-2"
              >
                {zoom}%
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
