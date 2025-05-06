"use client";

import { useMutation } from "../../../../liveblocks.config";
import { CanvasMode, Color, Point } from "../../../types/canvas";

/**
 * Hook for drawing operations
 * 
 * @param canvasMode Current canvas mode
 * @param lastUsedColor Current color for drawing
 * @returns Drawing operation functions
 */
export function useDrawing(canvasMode: CanvasMode, lastUsedColor: Color) {
  // Start drawing
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      console.log("Start drawing at point:", point, "with color:", lastUsedColor);

      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor],
  );

  // Continue drawing
  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft, penColor } = self.presence;

      if (
        canvasMode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      )
        return;

      // Always use the current penColor or fallback to lastUsedColor
      const currentPenColor = penColor || lastUsedColor;

      // Only add a new point if it's different from the last one
      let newDraft: [number, number, number][] = pencilDraft;

      // Check if we need to add a new point
      if (!(pencilDraft.length === 1 &&
        pencilDraft[0][0] === point.x &&
        pencilDraft[0][1] === point.y)) {
        newDraft = [...pencilDraft, [point.x, point.y, e.pressure] as [number, number, number]];
      }

      setMyPresence({
        cursor: point,
        pencilDraft: newDraft,
        penColor: currentPenColor,
      });
    },
    [canvasMode, lastUsedColor],
  );

  return {
    startDrawing,
    continueDrawing
  };
}
