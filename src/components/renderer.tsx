import Quill from 'quill';
import { useEffect, useRef, useState } from 'react';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { addMentionClickHandlers } from '@/lib/mention-handler';
import { useGetMembers } from '@/features/members/api/use-get-members';

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

  useEffect(() => {
    if (!rendererRef.current) return;

    const container = rendererRef.current;

    const quill = new Quill(document.createElement('div'), {
      theme: 'snow'
    });

    quill.enable(false);

    const contents = JSON.parse(value);
    quill.setContents(contents);

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

      // Remove date/time patterns from the text content
      let cleanedText = textContent;
      for (const dateFormat of dateFormats) {
        for (const timeVariation of timeVariations) {
          const pattern = dateFormat + timeVariation;
          cleanedText = cleanedText.replace(pattern, '');
        }
      }

      // Clean up any double spaces left after removal
      cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

      // Set the cleaned text back to the quill instance
      quill.setText(cleanedText);
    }

    // Get the HTML content after cleaning
    let htmlContent = quill.root.innerHTML;

    // Add the HTML content to the container
    container.innerHTML = htmlContent;

    // Add click handlers to mentions
    addMentionClickHandlers(container);

    // Log for debugging
    console.log('Renderer: Added click handlers to mentions in workspace:', workspaceId);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [value, calendarEvent, workspaceId, members]);

  if (isEmpty) return null;

  return <div ref={rendererRef} className="ql-editor ql-renderer" />;
};

export default Renderer;
