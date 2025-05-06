"use client";

import { useState, useCallback } from "react";
import { Camera } from "../../../types/canvas";

/**
 * Hook to manage camera position for canvas panning
 * 
 * @param initialPosition Initial camera position
 * @returns Camera position and handlers
 */
export function useCamera(initialPosition: Camera = { x: 0, y: 0 }) {
  const [camera, setCamera] = useState<Camera>(initialPosition);
  
  // Handle wheel events for panning
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);
  
  return {
    camera,
    setCamera,
    onWheel
  };
}
