"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "../../../../liveblocks.config";
import { MermaidLayer } from "../types/canvas";
import { colorToCSS } from "../../../lib/utils";
import { MermaidEditDialog } from "./mermaid-edit-dialog";

type MermaidProps = {
  id: string;
  layer: MermaidLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Mermaid = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: MermaidProps) => {
  const { x, y, width, height, fill, mermaidCode } = layer;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Update layer content
  const updateMermaidCode = useMutation(
    ({ storage }, newCode: string) => {
      const liveLayers = storage.get("layers");
      if (liveLayers) {
        const layer = liveLayers.get(id);
        if (layer) {
          // Type assertion to ensure we can access mermaidCode property
          (layer as any).set("mermaidCode", newCode);
        }
      }
    },
    [id]
  );

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const renderMermaid = async () => {
      if (!mermaidCode) {
        console.log('No mermaid code provided');
        return;
      }

      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.log('Not in browser environment');
        return;
      }

      console.log('Starting mermaid rendering for:', id, 'with code:', mermaidCode);

      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import of mermaid to avoid SSR issues
        const mermaid = (await import('mermaid')).default;
        console.log('Mermaid imported successfully');

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
          },
        });
        console.log('Mermaid initialized');

        // Generate unique ID for this diagram
        const diagramId = `mermaid-${id}-${Date.now()}`;
        console.log('Rendering with ID:', diagramId);

        // Render the mermaid diagram
        const { svg } = await mermaid.render(diagramId, mermaidCode);
        console.log('Mermaid rendered successfully, SVG length:', svg.length);

        // Clean up the SVG to make it responsive
        const cleanedSvg = svg
          .replace(/width="[^"]*"/, 'width="100%"')
          .replace(/height="[^"]*"/, 'height="100%"');

        console.log('SVG cleaned, setting rendered SVG');
        setRenderedSvg(cleanedSvg);
        setIsLoading(false);
        console.log('Rendering complete');
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to render diagram: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(renderMermaid, 200);
    return () => clearTimeout(timer);
  }, [mermaidCode, id, isMounted]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleSaveMermaidCode = (newCode: string) => {
    updateMermaidCode(newCode);
  };

  // Don't render anything until mounted (SSR safety)
  if (!isMounted) {
    return (
      <>
        <foreignObject
          x={x}
          y={y}
          width={width}
          height={height}
          onPointerDown={(e) => onPointerDown(e, id)}
          onDoubleClick={handleDoubleClick}
          style={{
            outline: selectionColor ? `1px solid ${selectionColor}` : "none",
            backgroundColor: fill ? colorToCSS(fill) : "#f9f9f9",
          }}
          className="shadow-md drop-shadow-xl cursor-pointer"
        >
          <div
            className="h-full w-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
            style={{ fontSize: '12px', color: '#666' }}
          >
            <div className="text-center">
              <div>Loading...</div>
            </div>
          </div>
        </foreignObject>

        {/* Edit Dialog */}
        <MermaidEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mermaidCode={mermaidCode}
          onSave={handleSaveMermaidCode}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <foreignObject
          x={x}
          y={y}
          width={width}
          height={height}
          onPointerDown={(e) => onPointerDown(e, id)}
          onDoubleClick={handleDoubleClick}
          style={{
            outline: selectionColor ? `1px solid ${selectionColor}` : "none",
            backgroundColor: fill ? colorToCSS(fill) : "#f9f9f9",
          }}
          className="shadow-md drop-shadow-xl cursor-pointer"
        >
          <div
            className="h-full w-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded"
            style={{ fontSize: '12px', color: '#666' }}
          >
            <div className="text-center">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div>Rendering diagram...</div>
            </div>
          </div>
        </foreignObject>

        {/* Edit Dialog */}
        <MermaidEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mermaidCode={mermaidCode}
          onSave={handleSaveMermaidCode}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <foreignObject
          x={x}
          y={y}
          width={width}
          height={height}
          onPointerDown={(e) => onPointerDown(e, id)}
          onDoubleClick={handleDoubleClick}
          style={{
            outline: selectionColor ? `1px solid ${selectionColor}` : "none",
            backgroundColor: fill ? colorToCSS(fill) : "#fee2e2",
          }}
          className="shadow-md drop-shadow-xl cursor-pointer"
        >
          <div
            className="h-full w-full flex items-center justify-center bg-red-50 border border-red-300 rounded text-red-600"
            style={{ fontSize: '12px' }}
          >
            <div className="text-center p-2">
              <div className="font-medium mb-1">Diagram Error</div>
              <div className="text-xs">{error}</div>
            </div>
          </div>
        </foreignObject>

        {/* Edit Dialog */}
        <MermaidEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mermaidCode={mermaidCode}
          onSave={handleSaveMermaidCode}
        />
      </>
    );
  }

  return (
    <>
      <foreignObject
        x={x}
        y={y}
        width={width}
        height={height}
        onPointerDown={(e) => onPointerDown(e, id)}
        onDoubleClick={handleDoubleClick}
        style={{
          outline: selectionColor ? `1px solid ${selectionColor}` : "none",
          backgroundColor: fill ? colorToCSS(fill) : "white",
        }}
        className="shadow-md drop-shadow-xl cursor-pointer"
      >
        <div
          ref={containerRef}
          className="h-full w-full overflow-hidden rounded border border-gray-200 bg-white"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          }}
        >
          {renderedSvg && (
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: renderedSvg }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          )}
        </div>
      </foreignObject>

      {/* Edit Dialog */}
      <MermaidEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mermaidCode={mermaidCode}
        onSave={handleSaveMermaidCode}
      />
    </>
  );
};
