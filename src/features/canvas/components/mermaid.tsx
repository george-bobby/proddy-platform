"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "../../../../liveblocks.config";
import { MermaidLayer } from "../types/canvas";
import { colorToCSS } from "../../../lib/utils";

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

  // Update layer content
  const updateMermaidCode = useMutation(
    ({ storage }, newCode: string) => {
      const liveLayers = storage.get("layers");
      if (liveLayers) {
        const layer = liveLayers.get(id);
        if (layer) {
          layer.set("mermaidCode", newCode);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    const renderMermaid = async () => {
      if (!mermaidCode || !containerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import of mermaid to avoid SSR issues
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        // Generate unique ID for this diagram
        const diagramId = `mermaid-${id}-${Date.now()}`;
        
        // Render the mermaid diagram
        const { svg } = await mermaid.render(diagramId, mermaidCode);
        
        setRenderedSvg(svg);
        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
        setIsLoading(false);
      }
    };

    renderMermaid();
  }, [mermaidCode, id]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Open edit dialog for mermaid code
    console.log('Double-clicked mermaid diagram:', id);
  };

  if (isLoading) {
    return (
      <foreignObject
        x={x}
        y={y}
        width={width}
        height={height}
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          outline: selectionColor ? `1px solid ${selectionColor}` : "none",
          backgroundColor: fill ? colorToCSS(fill) : "#f9f9f9",
        }}
        className="shadow-md drop-shadow-xl"
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
    );
  }

  if (error) {
    return (
      <foreignObject
        x={x}
        y={y}
        width={width}
        height={height}
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          outline: selectionColor ? `1px solid ${selectionColor}` : "none",
          backgroundColor: fill ? colorToCSS(fill) : "#fee2e2",
        }}
        className="shadow-md drop-shadow-xl"
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
    );
  }

  return (
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
        className="h-full w-full overflow-hidden rounded border border-gray-200"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }}
        dangerouslySetInnerHTML={{ __html: renderedSvg }}
      />
    </foreignObject>
  );
};
