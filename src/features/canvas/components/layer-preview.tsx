"use client";

import React, { memo } from "react";

import { colorToCSS } from "../../../lib/utils";
import { LayerType, type Layer } from "../../../types/canvas";
import { useStorage } from "../../../../liveblocks.config";

import { Ellipse } from "./eliipse";
import { Note } from "./note";
import { Rectangle } from "./rectangle";
import { Text } from "./text";
import { Path } from "./path";

type LayerPreviewProps = {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
};

export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    // Force re-render when lastUpdate changes
    const lastUpdate = useStorage((root) => root.lastUpdate);

    const layer = useStorage((root) => {
      // Check if root.layers exists and has a get method
      if (root.layers && typeof root.layers.get === 'function') {
        const layer = root.layers.get(id);
        if (layer) {
          console.log(`Retrieved layer with id ${id}:`, layer);
          return layer;
        } else {
          console.warn(`Layer with id ${id} not found in LiveMap`);
        }
      } else {
        console.warn(`Layer with id ${id} not found or layers is not a LiveMap`);
      }
      return null;
    });

    if (!layer) return null;

    // Get the layer type
    const type = layer.type;

    switch (type) {
      case LayerType.Path:
        return (
          <Path
            key={id}
            points={layer.points}
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCSS(layer.fill) : "#000"}
            stroke={selectionColor}
          />
        );
      case LayerType.Note:
        return (
          <Note
            id={id}
            layer={layer as any}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Text:
        return (
          <Text
            id={id}
            layer={layer as any}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={layer as any}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            onPointerDown={onLayerPointerDown}
            selectionColor={selectionColor}
            layer={layer as any}
          />
        );
      default:
        console.warn("Unknown layer type");
        return null;
    }
  },
);

LayerPreview.displayName = "LayerPreview";
