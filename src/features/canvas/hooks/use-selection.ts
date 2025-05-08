"use client";

import { useCallback } from "react";
import { useMutation } from "../../../../liveblocks.config";
import { CanvasMode, Point, Side, XYWH } from "../../../types/canvas";
import { findIntersectingLayersWithRectangle, resizeBounds } from "../../../lib/utils";

const MULTISELECTION_THRESHOLD = 2;

/**
 * Hook for selection operations
 *
 * @param canvasState Current canvas state
 * @param setCanvasState Function to update canvas state
 * @param layerIds Array of layer IDs
 * @param history History object for undo/redo
 * @returns Selection operation functions
 */
export function useSelection(
  canvasState: any,
  setCanvasState: (state: any) => void,
  layerIds: readonly string[],
  history: any
) {
  // Unselect all layers
  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  // Update selection net
  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      try {
        // Get the layers from storage
        const layersMap = storage.get("layers");

        // Check if layersMap is valid for intersection testing
        if (!layersMap) return;

        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });

        // Find intersecting layers
        const ids = findIntersectingLayersWithRectangle(
          layerIds,
          layersMap,
          origin,
          current,
        );

        setMyPresence({ selection: ids });
      } catch (error) {
        console.error("Error updating selection net:", error);
      }
    },
    [layerIds, setCanvasState],
  );

  // Start multi-selection
  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (
      Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) >
      MULTISELECTION_THRESHOLD
    ) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, [setCanvasState]);

  // Resize selected layer
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      try {
        // Calculate new bounds based on resize operation
        const bounds = resizeBounds(
          canvasState.initialBounds,
          canvasState.corner,
          point,
        );

        // Ensure minimum dimensions
        const minWidth = 20;
        const minHeight = 20;
        const newBounds = {
          ...bounds,
          width: Math.max(bounds.width, minWidth),
          height: Math.max(bounds.height, minHeight)
        };

        const liveLayers = storage.get("layers");

        // Check if liveLayers is a LiveMap with a get method
        if (!liveLayers || typeof liveLayers.get !== 'function') return;

        const layerId = self.presence.selection[0];
        if (!layerId) return;

        const layer = liveLayers.get(layerId);

        if (layer) {
          // Update the layer with new bounds
          layer.update(newBounds);

          // Force a storage update to ensure changes are synchronized
          storage.set("lastUpdate", Date.now());
        }
      } catch (error) {
        console.error("Error resizing layer:", error);
      }
    },
    [canvasState],
  );

  // Handle resize handle pointer down
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();

      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history, setCanvasState],
  );

  // Translate selected layers
  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      try {
        // Calculate the offset from the last position
        const offset = {
          x: point.x - canvasState.current.x,
          y: point.y - canvasState.current.y,
        };

        const liveLayers = storage.get("layers");

        // Check if liveLayers is a LiveMap with a get method
        if (!liveLayers || typeof liveLayers.get !== 'function') return;

        for (const id of self.presence.selection) {
          const layer = liveLayers.get(id);

          if (layer) {
            try {
              // Get current position
              let currentX, currentY;

              // Try to get properties using get method first (for LiveObjects)
              if (typeof layer.get === 'function') {
                currentX = layer.get("x");
                currentY = layer.get("y");
              } else {
                // Fall back to direct property access
                currentX = layer.x;
                currentY = layer.y;
              }

              // Ensure we have valid numbers
              if (typeof currentX !== 'number' || typeof currentY !== 'number') {
                console.warn('Invalid layer position', { currentX, currentY });
                continue;
              }

              // Update the layer position
              layer.update({
                x: currentX + offset.x,
                y: currentY + offset.y,
              });
            } catch (error) {
              console.error("Error updating layer position:", error);
            }
          }
        }

        // Update the current point for the next translation
        setCanvasState({
          mode: CanvasMode.Translating,
          current: point
        });

        // Force a storage update to ensure changes are synchronized
        storage.set("lastUpdate", Date.now());
      } catch (error) {
        console.error("Error translating layers:", error);
      }
    },
    [canvasState, setCanvasState],
  );

  return {
    unselectLayers,
    updateSelectionNet,
    startMultiSelection,
    resizeSelectedLayer,
    onResizeHandlePointerDown,
    translateSelectedLayers
  };
}
