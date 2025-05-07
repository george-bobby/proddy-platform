import { getSvgPathFromStroke } from "../../../lib/utils";
import getStroke from "perfect-freehand";
import React from "react";

type PathProps = {
  x: number;
  y: number;
  points: number[][];
  fill: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  stroke?: string;
  strokeWidth?: number;
};

export const Path = ({
  x,
  y,
  points,
  fill,
  onPointerDown,
  stroke,
  strokeWidth = 16,
}: PathProps) => {
  // Log the path properties for debugging
  console.log("Rendering path at:", { x, y, pointsCount: points.length, strokeWidth });

  // Process the stroke with perfect-freehand
  const strokePath = getStroke(points, {
    size: strokeWidth,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  // Convert the stroke to an SVG path
  const pathData = getSvgPathFromStroke(strokePath);

  return (
    <path
      className="drop-shadow-md"
      onPointerDown={onPointerDown}
      d={pathData}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
    />
  );
};
