"use client";

import React from "react";
import { Camera, CanvasMode, CanvasState, Color, Point } from "../../../types/canvas";
import { colorToCSS } from "../../../lib/utils";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";
import { Path } from "./path";
import { SelectionBox } from "./selection-box";

interface CanvasSurfaceProps {
  camera: Camera;
  canvasState: CanvasState;
  layerIds: string[];
  pencilDraft: [number, number, number][] | null;
  lastUsedColor: Color;
  layerIdsToColorSelection: Record<string, string>;
  onWheel: (e: React.WheelEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  onResizeHandlePointerDown: (corner: any, initialBounds: any) => void;
}

/**
 * The main canvas drawing surface component
 */
export const CanvasSurface = ({
  camera,
  canvasState,
  layerIds,
  pencilDraft,
  lastUsedColor,
  layerIdsToColorSelection,
  onWheel,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onLayerPointerDown,
  onResizeHandlePointerDown
}: CanvasSurfaceProps) => {
  // Determine the cursor style based on the canvas state
  const getCursorStyle = () => {
    switch (canvasState.mode) {
      case CanvasMode.Pencil:
        return 'cursor-pencil';
      case CanvasMode.Eraser:
        return 'cursor-crosshair';
      case CanvasMode.Inserting:
        return 'cursor-crosshair';
      case CanvasMode.Pressing:
      case CanvasMode.SelectionNet:
        return 'cursor-crosshair';
      case CanvasMode.Translating:
        return 'cursor-move';
      case CanvasMode.Resizing:
        return 'cursor-nwse-resize';
      default:
        return 'cursor-default';
    }
  };

  return (
    <svg
      className={`h-[100vh] w-[100vw] ${getCursorStyle()}`}
      onWheel={onWheel}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <g
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px)`,
        }}
      >
        {Array.isArray(layerIds) && layerIds.length > 0 ? (
          layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))
        ) : (
          <g>
            {/* Empty canvas state */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="#888"
              fontSize="14"
              fontFamily="sans-serif"
            >
              Canvas is empty. Start drawing or add shapes.
            </text>
          </g>
        )}
        <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
        {canvasState.mode === CanvasMode.SelectionNet &&
          canvasState.current != null && (
            <rect
              className="fill-blue-500/5 stroke-blue-500 stroke-1"
              x={Math.min(canvasState.origin.x, canvasState.current.x)}
              y={Math.min(canvasState.origin.y, canvasState.current.y)}
              width={Math.abs(canvasState.origin.x - canvasState.current.x)}
              height={Math.abs(canvasState.origin.y - canvasState.current.y)}
            />
          )}
        <CursorsPresence />
        {pencilDraft != null && pencilDraft.length > 0 && (
          <Path
            points={pencilDraft}
            fill={colorToCSS(lastUsedColor)}
            x={0}
            y={0}
          />
        )}
      </g>
    </svg>
  );
};
