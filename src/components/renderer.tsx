import Quill from 'quill';
import { useEffect, useRef, useState } from 'react';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { addMentionClickHandlers } from '@/lib/mention-handler';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { CanvasMessage } from '@/features/messages/components/canvas-message';
import { CanvasLiveMessage } from '@/features/messages/components/canvas-live-message';

interface RendererProps {
  value: string;
  calendarEvent?: {
    date: number;
    time?: string;
  };
}

const Renderer = ({ value, calendarEvent }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);
  const workspaceId = useWorkspaceId();
  const { data: members } = useGetMembers({ workspaceId });

  // Check if this is a canvas message
  const isCanvasMessage = () => {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed.type === 'canvas';
    } catch (e) {
      return false;
    }
  };

  // Check if this is a live canvas message
  const isCanvasLiveMessage = () => {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed.type === 'canvas-live';
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // If this is a canvas message or live canvas message, don't process with Quill
    if (isCanvasMessage() || isCanvasLiveMessage()) {
      setIsEmpty(false);
      return;
    }

    if (!rendererRef.current) return;

    const container = rendererRef.current;

    const quill = new Quill(document.createElement('div'), {
      theme: 'snow'
    });

    quill.enable(false);

    // Try to parse the value as JSON, but handle non-JSON content gracefully
    try {
      const contents = JSON.parse(value);
      quill.setContents(contents);
    } catch (error) {
      // If it's not valid JSON, it might be HTML or plain text
      console.log('Renderer: Failed to parse value as JSON, treating as HTML/text', error);

      // Check if it looks like HTML
      if (value.trim().startsWith('<') && value.trim().endsWith('>')) {
        // It's likely HTML, set it directly
        quill.root.innerHTML = value;
      } else {
        // Treat as plain text
        quill.setText(value);
      }
    }

    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, '')
        .trim().length === 0;

    setIsEmpty(isEmpty);

    // If this message has a calendar event, remove date/time from the displayed content
    if (calendarEvent) {
      // First, get the text content
      const textContent = quill.getText();

      // Get the date in various formats to remove from text
      const dateObj = new Date(calendarEvent.date);
      const dateStr = dateObj.toLocaleDateString();
      const timeStr = calendarEvent.time || '';

      // Create different date format variations to match what might be in the text
      const dateFormats = [
        dateStr,
        dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }),
        dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`,
        `${dateObj.getMonth() + 1}-${dateObj.getDate()}-${dateObj.getFullYear()}`,
        'Today',
        'Tomorrow',
        'Next week',
        'Next week - Monday',
        'Next week - Tuesday',
        'Next week - Wednesday',
        'Next week - Thursday',
        'Next week - Friday',
        'Next week - Saturday',
        'Next week - Sunday'
      ];

      // Create time variations
      const timeVariations = timeStr ? [
        ` at ${timeStr}`,
        ` ${timeStr}`,
        `, ${timeStr}`
      ] : [''];

      let cleanedText = textContent;
      for (const dateFormat of dateFormats) {
        for (const timeVariation of timeVariations) {
          const pattern = dateFormat + timeVariation;
          cleanedText = cleanedText.replace(pattern, '');
        }
      }

      cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
      quill.setText(cleanedText);
    }

    let htmlContent = quill.root.innerHTML;
    container.innerHTML = htmlContent;

    // Add click handlers to mentions
    addMentionClickHandlers(container);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [value, calendarEvent, workspaceId, members]);

  // If this is a canvas message, render the CanvasMessage component
  if (isCanvasMessage()) {
    try {
      const canvasData = JSON.parse(value);
      return <CanvasMessage data={canvasData} />;
    } catch (e) {
      console.error("Error parsing canvas data:", e);
      return <div>Error displaying canvas</div>;
    }
  }

  // If this is a live canvas message, render the CanvasLiveMessage component
  if (isCanvasLiveMessage()) {
    try {
      const canvasLiveData = JSON.parse(value);
      return <CanvasLiveMessage data={canvasLiveData} />;
    } catch (e) {
      console.error("Error parsing live canvas data:", e);
      return <div>Error displaying live canvas</div>;
    }
  }

  if (isEmpty) return null;

  return <div ref={rendererRef} className="ql-editor ql-renderer" />;
};

export default Renderer;
