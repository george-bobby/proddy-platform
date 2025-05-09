import { Kalam } from "next/font/google";
import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable";
import { useRef, useEffect, useState } from "react";

import { cn, colorToCSS } from "../../../lib/utils";
import type { TextLayer } from "../../../types/canvas";
import { useMutation, useStorage } from "../../../../liveblocks.config";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.5;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);
};

// Minimum dimensions for text boxes
const MIN_WIDTH = 100;
const MIN_HEIGHT = 50;

// Helper to estimate text dimensions
const estimateTextDimensions = (text: string, fontSize: number): { width: number, height: number } => {
  // Create a temporary span to measure text
  const span = document.createElement('span');
  span.style.font = `${fontSize}px ${font.style.fontFamily}`;
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.whiteSpace = 'pre-wrap';
  span.style.maxWidth = '1000px'; // Arbitrary large width
  span.textContent = text || 'Text';

  document.body.appendChild(span);

  // Get dimensions
  const rect = span.getBoundingClientRect();
  const width = Math.max(MIN_WIDTH, rect.width + 40); // Add padding
  const height = Math.max(MIN_HEIGHT, rect.height + 20); // Add padding

  document.body.removeChild(span);

  return { width, height };
};

type TextProps = {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const Text = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: TextProps) => {
  const { x, y, width, height, fill, value } = layer;
  const contentRef = useRef<HTMLElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPositionRef = useRef({ x, y });

  // Update initialPositionRef when layer props change
  useEffect(() => {
    initialPositionRef.current = { x, y };
  }, [x, y]);

  // Force update when lastUpdate changes
  const lastUpdate = useStorage((root) => root.lastUpdate);

  // Get current selection state
  const isSelected = useStorage((root) => {
    const myPresence = root.presence?.get(root.self?.id);
    return myPresence?.selection?.includes(id) || false;
  });

  // Sync with selection state
  useEffect(() => {
    // If we're selected but not dragging, make sure our position is up to date
    if (isSelected && !isDragging) {
      initialPositionRef.current = { x, y };
    }
  }, [isSelected, isDragging, x, y]);

  // Update layer value
  const updateValue = useMutation(({ storage }, newValue: string) => {
    const liveLayers = storage.get("layers");

    if (!liveLayers || typeof liveLayers.get !== 'function') {
      console.error("Error: liveLayers is not a LiveMap or doesn't have a get method", liveLayers);
      return;
    }

    const layer = liveLayers.get(id);

    if (layer) {
      layer.update({
        value: newValue
      });
    }
  }, []);

  // Update layer dimensions
  const updateDimensions = useMutation(({ storage }, newDimensions: { width: number, height: number }) => {
    const liveLayers = storage.get("layers");

    if (!liveLayers || typeof liveLayers.get !== 'function') {
      console.error("Error: liveLayers is not a LiveMap or doesn't have a get method", liveLayers);
      return;
    }

    const layer = liveLayers.get(id);

    if (layer) {
      layer.update(newDimensions);
    }
  }, []);

  // Update layer position
  const updatePosition = useMutation(({ storage }, newPosition: { x: number, y: number }) => {
    try {
      // Validate input
      if (typeof newPosition.x !== 'number' || typeof newPosition.y !== 'number' ||
          isNaN(newPosition.x) || isNaN(newPosition.y)) {
        console.error("Invalid position values:", newPosition);
        return;
      }

      const liveLayers = storage.get("layers");

      if (!liveLayers || typeof liveLayers.get !== 'function') {
        console.error("Error: liveLayers is not a LiveMap or doesn't have a get method", liveLayers);
        return;
      }

      const layer = liveLayers.get(id);

      if (layer) {
        // Update the layer with the new position
        layer.update(newPosition);

        // Force a storage update to ensure changes are synchronized
        storage.set("lastUpdate", Date.now());
      }
    } catch (error) {
      console.error("Error updating text position:", error);
    }
  }, []);

  // Handle content change
  const handleContentChange = (e: ContentEditableEvent) => {
    const newValue = e.target.value;
    updateValue(newValue);

    // Calculate new dimensions based on content
    const fontSize = calculateFontSize(width, height);
    const newDimensions = estimateTextDimensions(newValue, fontSize);

    // Only update dimensions if they've changed significantly
    if (
      Math.abs(newDimensions.width - width) > 10 ||
      Math.abs(newDimensions.height - height) > 10
    ) {
      updateDimensions(newDimensions);
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');

    // Insert at cursor position or replace selection
    document.execCommand('insertText', false, text);

    // Get the updated content
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML;
      updateValue(newContent);

      // Calculate new dimensions based on the full content
      const fontSize = calculateFontSize(width, height);
      const newDimensions = estimateTextDimensions(newContent, fontSize);

      // Update dimensions
      updateDimensions(newDimensions);
    }
  };

  // Handle pointer down
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();

    // If we're already in editing mode, don't do anything else
    if (isEditing) {
      return;
    }

    // If it's a double click, enter editing mode
    if (e.detail === 2) {
      setIsEditing(true);
      return;
    }

    // First call the onPointerDown handler to select the layer
    // This needs to happen before we start dragging
    onPointerDown(e, id);

    // Wait a short time to ensure the selection is processed
    // before starting our own dragging
    setTimeout(() => {
      // Only start dragging if we're not in editing mode
      if (!isEditing) {
        // Always ensure we have the latest position
        initialPositionRef.current = { x, y };

        // For single clicks, start dragging
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };

        // Add event listeners for dragging
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
      }
    }, 0);
  };

  // Handle pointer move (for dragging)
  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;

    try {
      // Calculate the delta from the drag start position
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      // Only update if there's actual movement
      if (dx === 0 && dy === 0) return;

      // Calculate new position based on the initial position plus the delta
      const newX = initialPositionRef.current.x + dx;
      const newY = initialPositionRef.current.y + dy;

      // Update position
      updatePosition({
        x: newX,
        y: newY
      });
    } catch (error) {
      console.error("Error during text dragging:", error);
      // If there's an error, stop dragging to prevent further issues
      setIsDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    }
  };

  // Handle pointer up (end dragging)
  const handlePointerUp = () => {
    try {
      if (isDragging) {
        // Update the initialPositionRef with the final position
        // This ensures that the next drag operation starts from the correct position
        initialPositionRef.current = { x, y };

        // Reset dragging state
        setIsDragging(false);
      }
    } catch (error) {
      console.error("Error during text pointer up:", error);
    } finally {
      // Always remove event listeners to prevent memory leaks
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    }
  };

  // Add document-level click handler to exit editing mode
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEditing && contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Set up ref to access the ContentEditable element
  const setContentRef = (el: any) => {
    contentRef.current = el;
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
        pointerEvents: "auto", // Ensure pointer events are enabled
      }}
      data-selected={isSelected ? "true" : "false"} // Add data attribute for debugging
    >
      <div
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        style={{
          cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <ContentEditable
          innerRef={setContentRef}
          html={value || "Text"}
          onChange={handleContentChange}
          onPaste={handlePaste}
          disabled={!isEditing}
          className={cn(
            "h-full w-full flex items-center justify-center text-center drop-shadow-md outline-none",
            font.className
          )}
          style={{
            fontSize: calculateFontSize(width, height),
            color: fill ? colorToCSS(fill) : "#000",
            overflow: "hidden",
            userSelect: isEditing ? "text" : "none",
            pointerEvents: isEditing ? "auto" : "none",
          }}
        />
      </div>
    </foreignObject>
  );
};
