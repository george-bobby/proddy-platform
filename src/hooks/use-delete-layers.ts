import { useMutation, useSelf } from "../../liveblocks.config";
import { LiveList, LiveMap } from "@liveblocks/client";

/**
 * Custom hook to delete selected layers from the canvas
 * @returns A function that deletes the currently selected layers
 */
export const useDeleteLayers = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(({ storage, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const liveLayerIds = storage.get("layerIds");

    // Check if liveLayers is a LiveMap with a delete method
    if (!liveLayers || typeof liveLayers.delete !== 'function') {
      console.error("Error: liveLayers is not a LiveMap or doesn't have a delete method", liveLayers);
      return;
    }

    // Delete each selected layer
    for (const id of selection) {
      // Delete from the layers map
      liveLayers.delete(id);

      // Remove from the layerIds array
      if (liveLayerIds) {
        // Check if it's a LiveList with delete method
        if (typeof liveLayerIds.delete === 'function') {
          const index = liveLayerIds.indexOf(id);
          if (index !== -1) {
            liveLayerIds.delete(index);
          }
        } else if (Array.isArray(liveLayerIds)) {
          // If it's a regular array, try to create a new LiveList without the id
          try {
            const newLayerIds = new LiveList(
              (liveLayerIds as string[]).filter(layerId => layerId !== id)
            );
            storage.set("layerIds", newLayerIds);
          } catch (error) {
            console.error("Failed to create new LiveList for layerIds:", error);
          }
        } else {
          console.warn("liveLayerIds is not a LiveList or array, cannot remove id");
        }
      }
    }

    // Clear the selection
    setMyPresence({ selection: [] }, { addToHistory: true });
  }, [selection]);
};
