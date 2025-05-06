// Define a type for camera position
export interface Camera {
  x: number;
  y: number;
}

// Array of colors for different users
const COLORS = [
  '#ec108c', // Primary color
  '#00a8ff',
  '#ff9500',
  '#ff2d55',
  '#5856d6',
  '#34c759',
  '#007aff',
  '#af52de',
  '#ff3b30',
  '#5ac8fa',
];

/**
 * Converts a connection ID to a consistent color
 */
export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}
