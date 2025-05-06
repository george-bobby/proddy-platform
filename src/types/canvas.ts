export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
};

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum LayerType {
  Path = "path",
  Rectangle = "rectangle",
  Ellipse = "ellipse",
  Text = "text",
  Note = "note",
}

export enum CanvasMode {
  None = "none",
  Pressing = "pressing",
  SelectionNet = "selection-net",
  Translating = "translating",
  Inserting = "inserting",
  Resizing = "resizing",
  Pencil = "pencil",
  Eraser = "eraser",
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current: Point;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Eraser;
    };

export type Layer = PathLayer | RectangleLayer | EllipseLayer | TextLayer | NoteLayer;

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  points: number[][];
};

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value: string;
};

export type NoteLayer = {
  type: LayerType.Note;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  value: string;
};

export enum Side {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

// Helper function to combine sides
export function combineSides(side1: Side, side2: Side): Side {
  if (side1 === Side.Top && side2 === Side.Left) return Side.TopLeft;
  if (side1 === Side.Top && side2 === Side.Right) return Side.TopRight;
  if (side1 === Side.Bottom && side2 === Side.Left) return Side.BottomLeft;
  if (side1 === Side.Bottom && side2 === Side.Right) return Side.BottomRight;

  // If the combination doesn't match any predefined side, return the first side
  return side1;
}
