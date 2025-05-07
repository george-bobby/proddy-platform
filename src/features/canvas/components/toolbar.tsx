import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
  Trash2,
  Eraser,
} from "lucide-react";
import { useState, useCallback } from "react";
import { useMutation, useRoom, useMyPresence } from "../../../../liveblocks.config";
import { LiveList } from "@liveblocks/client";

import { CanvasMode, LayerType, type CanvasState, type Color } from "../../../types/canvas";

import { ToolButton } from "./tool-button";
import { ColorPicker } from "./color-picker";
import { Slider } from "@/components/ui/slider";

type ToolbarProps = {
  canvasState?: CanvasState;
  setCanvasState?: (newState: CanvasState) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  effectiveId?: string;
  onColorChange?: (color: Color) => void;
  currentColor?: Color;
  strokeWidth?: number;
  onStrokeWidthChange?: (width: number) => void;
};

export const Toolbar = ({
  canvasState: externalCanvasState,
  setCanvasState: externalSetCanvasState,
  undo,
  redo,
  canRedo = false,
  canUndo = false,
  effectiveId,
  onColorChange,
  currentColor,
  strokeWidth: externalStrokeWidth,
  onStrokeWidthChange,
}: ToolbarProps = {}) => {
  // Create internal state if external state is not provided
  const [internalCanvasState, setInternalCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None
  });

  // Create internal stroke width state
  const [internalStrokeWidth, setInternalStrokeWidth] = useState<number>(16);

  // Use external state if provided, otherwise use internal state
  const canvasState = externalCanvasState || internalCanvasState;

  // Use external stroke width if provided, otherwise use internal stroke width
  const strokeWidth = externalStrokeWidth !== undefined ? externalStrokeWidth : internalStrokeWidth;

  // Get and update presence
  const [myPresence, updateMyPresence] = useMyPresence();

  // Create a safe setCanvasState function that handles the case when externalSetCanvasState is not provided
  const setCanvasState = useCallback((newState: CanvasState) => {
    if (externalSetCanvasState) {
      externalSetCanvasState(newState);
    } else {
      setInternalCanvasState(newState);

    }
  }, [externalSetCanvasState]);

  // Default no-op functions for undo/redo if not provided
  const handleUndo = useCallback(() => {
    if (undo) {
      undo();
    } else {

    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    if (redo) {
      redo();
    } else {

    }
  }, [redo]);

  // Get the room for debugging
  const room = useRoom();

  // Add clear canvas functionality
  const clearCanvas = useMutation(({ storage }) => {


    try {
      // Get the storage objects
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      // Check if we have a valid LiveMap object
      if (liveLayers && typeof liveLayers.entries === 'function') {
        // Get all keys from the LiveMap
        const keys = Array.from(liveLayers.entries()).map(([key]) => key);

        // Delete each layer individually
        for (const key of keys) {
          liveLayers.delete(key);

        }

      } else {

      }

      // Clear all layer IDs
      if (liveLayerIds) {
        // Check if it's a LiveList with a clear method
        if (typeof liveLayerIds.clear === 'function') {
          liveLayerIds.clear();

        }
        // If it's a LiveList without clear but with delete
        else if (typeof liveLayerIds.delete === 'function') {
          // Delete all items one by one from the end
          while (liveLayerIds.length > 0) {
            liveLayerIds.delete(liveLayerIds.length - 1);
          }

        }
        // If it's an array-like object with length
        else if (typeof liveLayerIds.length === 'number') {
          // Try to create a new empty LiveList and replace the existing one
          try {
            storage.set("layerIds", new LiveList([]));

          } catch (error) {

          }
        } else {

        }
      } else {
        // If layerIds doesn't exist, create a new empty one
        storage.set("layerIds", new LiveList([]));

      }

      // Force a storage update to ensure changes are synchronized
      storage.set("lastUpdate", Date.now());

      // Notify the user that the canvas has been cleared
      alert("Canvas cleared for all users in this channel");
    } catch (error) {
      alert("Failed to clear canvas. Please try again.");
    }
  }, [effectiveId, room.id]);
  // Default color if none provided
  const defaultColor: Color = { r: 0, g: 0, b: 0 };

  // Handle color change
  const handleColorChange = (color: Color) => {
    if (onColorChange) {
      onColorChange(color);
    }
  };

  // Handle stroke width change
  const handleStrokeWidthChange = (value: number[]) => {
    const newWidth = value[0];

    // Update internal state
    setInternalStrokeWidth(newWidth);

    // Call external handler if provided
    if (onStrokeWidthChange) {
      onStrokeWidthChange(newWidth);
    }

    // Update presence
    updateMyPresence({ strokeWidth: newWidth });

    // Update canvas state if in pencil mode
    if (canvasState.mode === CanvasMode.Pencil) {
      setCanvasState({
        mode: CanvasMode.Pencil,
        strokeWidth: newWidth
      });
    }
  };

  return (
    <div className="absolute top-[55%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
      <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
        <ToolButton
          label="Select"
          icon={MousePointer2}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
        />

        <ToolButton
          label="Text"
          icon={Type}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
        />

        <ToolButton
          label="Sticky note"
          icon={StickyNote}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
          }
        />

        <ToolButton
          label="Rectangle"
          icon={Square}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
          }
        />

        <ToolButton
          label="Ellipse"
          icon={Circle}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
          }
        />

        <ToolButton
          label="Pen"
          icon={Pencil}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
              strokeWidth: strokeWidth,
            })
          }
          isActive={canvasState.mode === CanvasMode.Pencil}
        />

        <ToolButton
          label="Eraser"
          icon={Eraser}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Eraser,
            })
          }
          isActive={canvasState.mode === CanvasMode.Eraser}
        />
      </div>

      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <ToolButton
          label="Undo"
          icon={Undo2}
          onClick={handleUndo}
          isDisabled={!canUndo}
        />
        <ToolButton
          label="Redo"
          icon={Redo2}
          onClick={handleRedo}
          isDisabled={!canRedo}
        />
      </div>

      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <ToolButton
          label="Clear Canvas"
          icon={Trash2}
          onClick={clearCanvas}
          variant="danger"
        />
      </div>

      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <ColorPicker onChange={handleColorChange} />
      </div>

      {/* Stroke width slider - only show when pen tool is active */}
      {canvasState.mode === CanvasMode.Pencil && (
        <div className="bg-white rounded-md p-3 flex flex-col items-center shadow-md">
          <div className="text-xs text-gray-500 mb-1">Stroke Width</div>
          <div className="w-[120px] px-2">
            <Slider
              value={[strokeWidth]}
              min={1}
              max={50}
              step={1}
              onValueChange={handleStrokeWidthChange}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{strokeWidth}px</div>
        </div>
      )}
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div
      className="absolute top-[55%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md"
      aria-hidden
    />
  );
};
