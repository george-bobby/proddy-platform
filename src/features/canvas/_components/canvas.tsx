"use client";

import { nanoid } from "nanoid";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { LiveObject, LiveMap, LiveList } from "@liveblocks/client";

import { useDisableScrollBounce } from "../../../hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "../../../hooks/use-delete-layers";
import {
  colorToCSS,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  findLayerAtPoint,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "../../../lib/utils";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useSelf,
  useStorage,
  useRoom,
} from "../../../../liveblocks.config";
import {
  type Camera,
  CanvasMode,
  type CanvasState,
  type Color,
  LayerType,
  type Point,
  type Side,
  type XYWH,
} from "../../../types/canvas";

import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";
import { Participants } from "./participants";
import { Path } from "./path";
import { SelectionBox } from "./selection-box";
import { Toolbar } from "./toolbar";
import { CanvasName } from "./canvas-name";

const MAX_LAYERS = 100;
const MULTISELECTION_THRESHOLD = 2; // Reduced from 5 to make selection easier to activate

type CanvasProps = {
  boardId?: string;
  canvasId?: string;
  savedCanvasName?: string | null;
};

export const Canvas = ({ boardId, canvasId, savedCanvasName }: CanvasProps) => {
  // Use canvasId if provided, otherwise fall back to boardId for backward compatibility
  const effectiveId = canvasId || boardId;
  console.log("Canvas component rendering with effectiveId:", effectiveId);
  console.log("Saved canvas name:", savedCanvasName);

  // Log the room ID for debugging - this should match the one used in the Room component
  const room = useRoom();
  console.log("Canvas connected to Liveblocks room:", room.id);

  // Get the entire storage for debugging if needed
  useStorage((root) => {
    // Just log the root object to verify it's properly initialized
    if (!root.layers || !root.layerIds) {
      console.warn("Storage root missing layers or layerIds:", root);
    }
    return root;
  });

  // Get the layerIds with fallback
  const layerIds = useStorage((root) => {
    console.log("Getting layerIds from root:", root);

    // Always return root.layerIds, even if it's not a LiveList
    // Our mutation functions will handle creating a LiveList if needed
    if (!root.layerIds) {
      console.warn("No layerIds found in storage, returning empty array");
      return [];
    }

    // Convert to array for debugging
    const layerIdsArray = Array.from(root.layerIds);
    console.log("Current layerIds in storage:", layerIdsArray);

    return root.layerIds;
  });

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point,
    ) => {
      try {
        console.log("insertLayer - storage object:", storage);

        // Get the storage objects
        let liveLayers = storage.get("layers");
        console.log("insertLayer - liveLayers:", liveLayers, "type:", typeof liveLayers, "constructor:", liveLayers?.constructor?.name);

        let liveLayerIds = storage.get("layerIds");
        console.log("insertLayer - liveLayerIds:", liveLayerIds, "type:", typeof liveLayerIds, "constructor:", liveLayerIds?.constructor?.name);

        // Check if liveLayers is a LiveMap with a set method
        if (!liveLayers || typeof liveLayers.set !== 'function') {
          console.error("Error: liveLayers is not a LiveMap or doesn't have a set method", liveLayers);

          // Try to create a new LiveMap and set it in storage
          try {
            console.log("Attempting to create a new LiveMap for layers");
            liveLayers = new LiveMap<string, LiveObject<any>>();
            storage.set("layers", liveLayers);
            console.log("Successfully created and set new LiveMap for layers");
          } catch (error) {
            console.error("Failed to create and set new LiveMap:", error);
            setCanvasState({ mode: CanvasMode.None });
            return;
          }
        }

        // Check if liveLayerIds is a LiveList with a push method
        if (!liveLayerIds || typeof liveLayerIds.push !== 'function') {
          console.error("Error: liveLayerIds is not a LiveList or doesn't have a push method", liveLayerIds);

          // Try to create a new LiveList and set it in storage
          try {
            console.log("Attempting to create a new LiveList for layerIds");
            liveLayerIds = new LiveList<string>([]);
            storage.set("layerIds", liveLayerIds);
            console.log("Successfully created and set new LiveList for layerIds");
          } catch (error) {
            console.error("Failed to create and set new LiveList:", error);
            setCanvasState({ mode: CanvasMode.None });
            return;
          }
        }

        // Check if we've reached the maximum number of layers
        if (liveLayers.size >= MAX_LAYERS) return;

        const layerId = nanoid();

        // Log the position for debugging
        console.log("Inserting layer at position:", position);

        // Center the shape around the clicked position
        // This ensures the shape appears centered where the user clicked
        const centerX = position.x - 50; // Half of width (100)
        const centerY = position.y - 50; // Half of height (100)

        console.log("Centered position:", { x: centerX, y: centerY });

        // Create the appropriate layer data
        let layerData;
        if (layerType === LayerType.Text || layerType === LayerType.Note) {
          layerData = {
            type: layerType,
            x: centerX,
            y: centerY,
            height: 100,
            width: 100,
            fill: lastUsedColor,
            value: "",
          };
        } else {
          layerData = {
            type: layerType,
            x: centerX,
            y: centerY,
            height: 100,
            width: 100,
            fill: lastUsedColor,
          };
        }

        console.log("Created layer data:", layerData);

        try {
          // Create a LiveObject and set it in the map
          const liveObject = new LiveObject(layerData);
          liveLayers.set(layerId, liveObject);
          console.log("Added layer to LiveMap with ID:", layerId);

          // Add the layer ID to the list
          if (typeof liveLayerIds.push === 'function') {
            liveLayerIds.push(layerId);
            console.log("Added layer ID to LiveList:", layerId);
          } else {
            console.warn("liveLayerIds.push is not a function, cannot add layerId");
            // Try to create a new LiveList and set it
            try {
              const newLayerIds = new LiveList([layerId]);
              storage.set("layerIds", newLayerIds);
              console.log("Created new LiveList for layerIds with the new ID");
            } catch (error) {
              console.error("Failed to create new LiveList for layerIds:", error);
            }
          }

          // Verify the layer was added correctly
          const verifyLayer = liveLayers.get(layerId);
          if (verifyLayer) {
            console.log("Successfully verified layer was added with ID:", layerId);
          } else {
            console.error("Layer was not added correctly, cannot retrieve it:", layerId);
          }

          // Verify the layer ID was added to the list
          const layerIdsArray = Array.from(liveLayerIds);
          if (layerIdsArray.includes(layerId)) {
            console.log("Successfully verified layer ID was added to the list:", layerId);
          } else {
            console.error("Layer ID was not added to the list correctly:", layerId);
          }

          console.log("Successfully added layer with ID:", layerId);
        } catch (error) {
          console.error("Error during LiveObject creation or storage:", error);
          setCanvasState({ mode: CanvasMode.None });
          return;
        }

        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setCanvasState({ mode: CanvasMode.None });
      } catch (error) {
        console.error("Error adding layer:", error);
        setCanvasState({ mode: CanvasMode.None });
      }
    },
    [lastUsedColor],
  );

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      try {
        // Calculate the offset from the last position
        const offset = {
          x: point.x - canvasState.current.x,
          y: point.y - canvasState.current.y,
        };

        console.log("Translating layers with offset:", offset);

        const liveLayers = storage.get("layers");

        // Check if liveLayers is a LiveMap with a get method
        if (!liveLayers || typeof liveLayers.get !== 'function') {
          console.error("Error: liveLayers is not a LiveMap or doesn't have a get method", liveLayers);
          return;
        }

        // Log the selected layers for debugging
        console.log("Selected layers for translation:", self.presence.selection);

        for (const id of self.presence.selection) {
          const layer = liveLayers.get(id);

          if (layer) {
            // Get current position
            const currentX = layer.get("x");
            const currentY = layer.get("y");

            // Calculate new position
            const newX = currentX + offset.x;
            const newY = currentY + offset.y;

            // Log the translation for debugging
            console.log(`Translating layer ${id} from (${currentX}, ${currentY}) to (${newX}, ${newY})`);

            // Update the layer position
            layer.update({
              x: newX,
              y: newY,
            });
          }
        }

        // Update the current point for the next translation
        setCanvasState({ mode: CanvasMode.Translating, current: point });

        // Force a storage update to ensure changes are synchronized
        storage.set("lastUpdate", Date.now());
      } catch (error) {
        console.error("Error translating layers:", error);
      }
    },
    [canvasState],
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      try {
        // Get the layers from storage
        const layersMap = storage.get("layers");

        // Check if layersMap is valid for intersection testing
        if (!layersMap) {
          console.error("Error: layersMap is not available", layersMap);
          return;
        }

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
    [layerIds],
  );

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
  }, []);

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft, penColor } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      )
        return;

      // Always use the current penColor or fallback to lastUsedColor
      const currentPenColor = penColor || lastUsedColor;

      // Log the drawing action for debugging
      console.log("Continue drawing with color:", currentPenColor);

      // Log drawing point for debugging (occasionally)
      if (Math.random() < 0.05) {
        console.log("Drawing point:", {
          x: point.x,
          y: point.y,
          pressure: e.pressure,
          draftLength: pencilDraft.length
        });
      }

      // Only add a new point if it's different from the last one
      // This helps prevent duplicate points that can cause rendering issues
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
        penColor: currentPenColor, // Ensure penColor is always set
      });
    },
    [canvasState.mode, lastUsedColor],
  );

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const { pencilDraft } = self.presence;

      if (
        pencilDraft == null ||
        pencilDraft.length < 2
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      try {
        console.log("insertPath - storage object:", storage);

        // Get the storage objects
        let liveLayers = storage.get("layers");
        console.log("insertPath - liveLayers:", liveLayers, "type:", typeof liveLayers, "constructor:", liveLayers?.constructor?.name);

        let liveLayerIds = storage.get("layerIds");
        console.log("insertPath - liveLayerIds:", liveLayerIds, "type:", typeof liveLayerIds, "constructor:", liveLayerIds?.constructor?.name);

        // Check if liveLayers is a LiveMap with a set method
        if (!liveLayers || typeof liveLayers.set !== 'function') {
          console.error("Error: liveLayers is not a LiveMap or doesn't have a set method", liveLayers);

          // Try to create a new LiveMap and set it in storage
          try {
            console.log("Attempting to create a new LiveMap for layers");
            liveLayers = new LiveMap<string, LiveObject<any>>();
            storage.set("layers", liveLayers);
            console.log("Successfully created and set new LiveMap for layers");
          } catch (error) {
            console.error("Failed to create and set new LiveMap:", error);
            setMyPresence({ pencilDraft: null });
            setCanvasState({ mode: CanvasMode.Pencil });
            return;
          }
        }

        // Check if liveLayerIds is a LiveList with a push method
        if (!liveLayerIds || typeof liveLayerIds.push !== 'function') {
          console.error("Error: liveLayerIds is not a LiveList or doesn't have a push method", liveLayerIds);

          // Try to create a new LiveList and set it in storage
          try {
            console.log("Attempting to create a new LiveList for layerIds");
            liveLayerIds = new LiveList<string>([]);
            storage.set("layerIds", liveLayerIds);
            console.log("Successfully created and set new LiveList for layerIds");
          } catch (error) {
            console.error("Failed to create and set new LiveList:", error);
            setMyPresence({ pencilDraft: null });
            setCanvasState({ mode: CanvasMode.Pencil });
            return;
          }
        }

        // Check if we've reached the maximum number of layers
        if (liveLayers.size >= MAX_LAYERS) {
          setMyPresence({ pencilDraft: null });
          return;
        }

        const id = nanoid();

        // Create the path layer
        const pathLayer = penPointsToPathLayer(pencilDraft, lastUsedColor);
        console.log("Created path layer:", pathLayer);

        try {
          // Create a LiveObject and set it in the map
          const liveObject = new LiveObject(pathLayer);

          // First add the layer ID to the list to ensure it's visible to other users
          if (typeof liveLayerIds.push === 'function') {
            liveLayerIds.push(id);
            console.log("Added layer ID to LiveList:", id);
          } else {
            console.warn("liveLayerIds.push is not a function, cannot add layerId");
            // Try to create a new LiveList and set it
            try {
              const newLayerIds = new LiveList([id]);
              storage.set("layerIds", newLayerIds);
              console.log("Created new LiveList for layerIds with the new ID");
            } catch (error) {
              console.error("Failed to create new LiveList for layerIds:", error);
            }
          }

          // Then set the layer in the map
          liveLayers.set(id, liveObject);
          console.log("Added layer to LiveMap with ID:", id);

          // Force a storage update to ensure changes are synchronized
          storage.set("lastUpdate", Date.now());

          // Verify the layer was added correctly
          const verifyLayer = liveLayers.get(id);
          if (verifyLayer) {
            console.log("Successfully verified layer was added with ID:", id);
          } else {
            console.error("Layer was not added correctly, cannot retrieve it:", id);
          }

          // Verify the layer ID was added to the list
          const layerIdsArray = Array.from(liveLayerIds);
          if (layerIdsArray.includes(id)) {
            console.log("Successfully verified layer ID was added to the list:", id);
          } else {
            console.error("Layer ID was not added to the list correctly:", id);
          }

          console.log("Successfully added path layer with ID:", id);
        } catch (error) {
          console.error("Error during LiveObject creation or storage:", error);
        }
      } catch (error) {
        console.error("Error adding path layer:", error);
      }

      // Clear the pencil draft after successfully adding the path
      setMyPresence({ pencilDraft: null });
      setCanvasState({ mode: CanvasMode.Pencil });
    },
    [lastUsedColor],
  );

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      // Log the drawing action for debugging
      console.log("Start drawing at point:", point, "with color:", lastUsedColor);

      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor],
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      try {
        const bounds = resizeBounds(
          canvasState.initialBounds,
          canvasState.corner,
          point,
        );

        const liveLayers = storage.get("layers");

        // Check if liveLayers is a LiveMap with a get method
        if (!liveLayers || typeof liveLayers.get !== 'function') {
          console.error("Error: liveLayers is not a LiveMap or doesn't have a get method", liveLayers);
          return;
        }

        const layer = liveLayers.get(self.presence.selection[0]);

        if (layer) {
          layer.update(bounds);
        }
      } catch (error) {
        console.error("Error resizing layer:", error);
      }
    },
    [canvasState],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();

      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  // Function to erase a layer - MOVED UP to avoid reference before initialization
  const eraseLayerById = useMutation(
    ({ storage }, layerId: string) => {
      if (!layerId) {
        console.warn("Attempted to erase a layer with null or undefined ID");
        return;
      }

      try {
        console.log("Erasing layer with ID:", layerId);

        // Get the storage objects
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");

        // Log the current state for debugging
        console.log("Current layers:", liveLayers ? Array.from(liveLayers.entries()).length : "No layers");
        console.log("Current layerIds:", liveLayerIds ? Array.from(liveLayerIds).length : "No layerIds");

        // Check if we have valid LiveMap and LiveList objects
        if (!liveLayers || typeof liveLayers.delete !== 'function') {
          console.error("Error: liveLayers is not a LiveMap or doesn't have a delete method");
          return;
        }

        if (!liveLayerIds) {
          console.error("Error: liveLayerIds is not available");
          return;
        }

        // Check if the layer exists before trying to delete it
        const layerExists = liveLayers.has(layerId);
        if (!layerExists) {
          console.warn(`Layer with ID ${layerId} does not exist in the LiveMap`);
          return;
        }

        // Delete the layer from the LiveMap
        liveLayers.delete(layerId);
        console.log(`Deleted layer with ID: ${layerId} from LiveMap`);

        // Find and remove the layer ID from the LiveList
        const layerIdsArray = Array.from(liveLayerIds);
        const index = layerIdsArray.indexOf(layerId);

        if (index !== -1 && typeof liveLayerIds.delete === 'function') {
          liveLayerIds.delete(index);
          console.log(`Removed layer ID: ${layerId} from LiveList at index: ${index}`);
        } else {
          console.warn(`Layer ID ${layerId} not found in layerIds list or delete method not available`);
        }

        // Force a storage update to ensure changes are synchronized
        storage.set("lastUpdate", Date.now());

        // Log the updated state for debugging
        console.log("Updated layers:", Array.from(liveLayers.entries()).length);
        console.log("Updated layerIds:", Array.from(liveLayerIds).length);

        console.log("Layer erased successfully");

        // Alert for debugging purposes
        // alert(`Erased layer with ID: ${layerId}`);
      } catch (error) {
        console.error("Error erasing layer:", error);
      }
    },
    []
  );

  const onPointerMove = useMutation(
    ({ setMyPresence, self, storage }, e: React.PointerEvent) => {
      e.preventDefault();

      // Get the SVG element for debugging
      const svgElement = e.currentTarget as SVGSVGElement;
      const svgRect = svgElement.getBoundingClientRect();

      // Log coordinates for debugging (only occasionally to avoid flooding console)
      if (Math.random() < 0.01) {
        console.log("Pointer event:", {
          clientX: e.clientX,
          clientY: e.clientY,
          svgLeft: svgRect.left,
          svgTop: svgRect.top,
          camera: camera
        });
      }

      const current = pointerEventToCanvasPoint(e, camera);

      // Always update cursor position first to ensure real-time cursor movement
      setMyPresence({
        cursor: current,
        // Preserve other presence values
        penColor: self.presence.penColor || lastUsedColor,
      });

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      } else if (canvasState.mode === CanvasMode.Eraser && e.buttons === 1) {
        // Only erase when mouse button is pressed
        console.log("Eraser mode active while moving - looking for layers to erase");

        // Get the layers from storage
        const liveLayers = storage.get("layers");

        if (!liveLayers) {
          console.error("No layers found in storage during pointer move");
          return;
        }

        // Find a layer at the current point with increased tolerance
        const layerId = findLayerAtPoint(layerIds, liveLayers, current, 15); // Use larger tolerance

        if (layerId) {
          console.log("Eraser found layer to erase while moving:", layerId);

          // Erase the layer
          eraseLayerById(layerId);

          // Force a re-render by updating lastUpdate
          storage.set("lastUpdate", Date.now());
        }
      }
    },
    [
      startMultiSelection,
      updateSelectionNet,
      continueDrawing,
      canvasState,
      resizeSelectedLayer,
      camera,
      translateSelectedLayers,
      lastUsedColor,
      layerIds,
      eraseLayerById,
    ],
  );

  const onPointerLeave = useMutation(({ setMyPresence, self }) => {
    setMyPresence({
      cursor: null,
      // Preserve other presence values
      penColor: self.presence.penColor || lastUsedColor,
    });
  }, [lastUsedColor]);

  const onPointerDown = useMutation(
    ({ storage }, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      console.log("Pointer down at point:", point, "Mode:", canvasState.mode);

      if (canvasState.mode === CanvasMode.Inserting) return;

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      // Handle eraser mode
      if (canvasState.mode === CanvasMode.Eraser) {
        console.log("Eraser mode active - looking for layers to erase");

        // Get the layers from storage
        const liveLayers = storage.get("layers");

        if (!liveLayers) {
          console.error("No layers found in storage");
          return;
        }

        console.log("Total layers in storage:", Array.from(liveLayers.entries()).length);
        console.log("Total layerIds:", layerIds.length);

        // Find a layer at the current point with increased tolerance
        const layerId = findLayerAtPoint(layerIds, liveLayers, point, 15); // Use larger tolerance

        if (layerId) {
          console.log("Eraser found layer to erase:", layerId);

          // Get the layer for debugging
          const layer = liveLayers.get(layerId);
          if (layer) {
            // Just log the layer object directly
            console.log("Layer details:", { id: layerId, layer });
          }

          // Erase the layer
          eraseLayerById(layerId);

          // Force a re-render by updating lastUpdate
          storage.set("lastUpdate", Date.now());
        } else {
          console.log("No layer found at point:", point);
        }

        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing, layerIds, eraseLayerById],
  );

  const onPointerUp = useMutation(
    ({ storage }, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        // When finishing a drawing, make sure to insert the path
        console.log("Pointer up in Pencil mode - inserting path");
        insertPath();

        // Force a storage update to ensure changes are synchronized
        try {
          storage.set("lastUpdate", Date.now());
        } catch (error) {
          console.error("Error updating lastUpdate timestamp:", error);
        }
      } else if (canvasState.mode === CanvasMode.Inserting) {
        console.log("Inserting layer in mode:", canvasState.mode, "with layerType:", canvasState.layerType);
        console.log("Pointer up at point:", point);

        // Get the SVG element for debugging
        const svgElement = e.currentTarget as SVGSVGElement;
        const svgRect = svgElement.getBoundingClientRect();

        console.log("SVG bounds:", {
          left: svgRect.left,
          top: svgRect.top,
          width: svgRect.width,
          height: svgRect.height
        });

        console.log("Camera position:", camera);

        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [
      setCanvasState,
      camera,
      canvasState,
      history,
      insertLayer,
      unselectLayers,
      insertPath,
    ],
  );

  // Use a simple mock implementation to avoid potential infinite loops
  const selections = useMemo(() => {
    return [
      [1, ["layer1", "layer2"]] as [number, string[]],
      [2, ["layer3"]] as [number, string[]]
    ];
  }, []);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence, storage }, e: React.PointerEvent, layerId: string) => {
      // Handle eraser mode
      if (canvasState.mode === CanvasMode.Eraser) {
        e.stopPropagation();
        console.log("Eraser mode: direct click on layer", layerId);

        // Get the layer for debugging
        const liveLayers = storage.get("layers");
        if (liveLayers) {
          const layer = liveLayers.get(layerId);
          if (layer) {
            console.log("Direct click on layer:", { id: layerId, layer });
          }
        }

        // Use our dedicated eraser function
        eraseLayerById(layerId);

        // Force a re-render by updating lastUpdate
        storage.set("lastUpdate", Date.now());

        return;
      }

      // Skip for pencil and inserting modes
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      )
        return;

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);
      console.log("Layer pointer down at point:", point, "for layer:", layerId);

      // Get the layer for debugging
      const liveLayers = storage.get("layers");
      if (liveLayers) {
        const layer = liveLayers.get(layerId);
        if (layer) {
          // Log layer details for debugging
          console.log("Selected layer details:", {
            id: layerId,
            layer,
            layerX: layer.get("x"),
            layerY: layer.get("y"),
            layerWidth: layer.get("width"),
            layerHeight: layer.get("height")
          });
        }
      }

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      // Store the current point for translation
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode, eraseLayerById],
  );

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey || e.altKey) history.redo();
            else history.undo();

            break;
          }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, history]);

  // Determine the cursor style based on the canvas state
  const getCursorStyle = () => {
    switch (canvasState.mode) {
      case CanvasMode.Pencil:
        return 'cursor-pencil';
      case CanvasMode.Eraser:
        return 'cursor-crosshair'; // Use crosshair cursor for eraser
      case CanvasMode.Inserting:
        if (canvasState.layerType === LayerType.Text) {
          return 'cursor-text';
        } else if (canvasState.layerType === LayerType.Note) {
          return 'cursor-note';
        } else {
          return 'cursor-crosshair';
        }
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
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Participants />
      <CanvasName savedCanvasName={savedCanvasName} />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
        effectiveId={effectiveId}
      />

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
    </main>
  );
};
