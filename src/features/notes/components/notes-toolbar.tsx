'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Type,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToolButton } from '@/features/canvas/components/tool-button';
import { Hint } from '@/components/hint';
import { cn } from '@/lib/utils';
import Quill from 'quill';

interface NotesToolbarProps {
  quillRef?: React.RefObject<Quill | null>;
  className?: string;
}

export const NotesToolbar = ({ quillRef, className }: NotesToolbarProps) => {
  const [activeFormats, setActiveFormats] = useState<Record<string, any>>({});
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update active formats when selection changes
  useEffect(() => {
    if (!quillRef?.current) return;

    const quill = quillRef.current;

    const updateFormats = () => {
      const selection = quill.getSelection();
      if (selection) {
        const formats = quill.getFormat(selection);
        setActiveFormats(formats);
      }
    };

    const updateHistory = () => {
      const history = (quill as any).history;
      if (history) {
        setCanUndo(history.stack.undo.length > 0);
        setCanRedo(history.stack.redo.length > 0);
      }
    };

    // Listen for selection and text changes
    quill.on('selection-change', updateFormats);
    quill.on('text-change', () => {
      updateFormats();
      updateHistory();
    });

    // Initial update
    updateFormats();
    updateHistory();

    return () => {
      quill.off('selection-change', updateFormats);
      quill.off('text-change', updateFormats);
    };
  }, [quillRef]);

  const applyFormat = useCallback((format: string, value?: any) => {
    if (!quillRef?.current) return;

    const quill = quillRef.current;
    const selection = quill.getSelection();
    
    if (!selection) {
      quill.focus();
      return;
    }

    if (value !== undefined) {
      quill.format(format, value);
    } else {
      const currentFormat = quill.getFormat(selection);
      quill.format(format, !currentFormat[format]);
    }
  }, [quillRef]);

  const applyHeader = useCallback((level: number) => {
    if (!quillRef?.current) return;

    const quill = quillRef.current;
    const selection = quill.getSelection();
    
    if (!selection) {
      quill.focus();
      return;
    }

    const currentFormat = quill.getFormat(selection);
    const newValue = currentFormat.header === level ? false : level;
    quill.format('header', newValue);
  }, [quillRef]);

  const applyList = useCallback((listType: 'bullet' | 'ordered') => {
    if (!quillRef?.current) return;

    const quill = quillRef.current;
    const selection = quill.getSelection();
    
    if (!selection) {
      quill.focus();
      return;
    }

    const currentFormat = quill.getFormat(selection);
    const newValue = currentFormat.list === listType ? false : listType;
    quill.format('list', newValue);
  }, [quillRef]);

  const applyAlign = useCallback((alignment: string) => {
    if (!quillRef?.current) return;

    const quill = quillRef.current;
    const selection = quill.getSelection();
    
    if (!selection) {
      quill.focus();
      return;
    }

    const currentFormat = quill.getFormat(selection);
    const newValue = currentFormat.align === alignment ? false : alignment;
    quill.format('align', newValue);
  }, [quillRef]);

  const handleUndo = useCallback(() => {
    if (!quillRef?.current) return;
    const history = (quillRef.current as any).history;
    if (history) {
      history.undo();
    }
  }, [quillRef]);

  const handleRedo = useCallback(() => {
    if (!quillRef?.current) return;
    const history = (quillRef.current as any).history;
    if (history) {
      history.redo();
    }
  }, [quillRef]);

  const insertLink = useCallback(() => {
    if (!quillRef?.current) return;

    const quill = quillRef.current;
    const selection = quill.getSelection();
    
    if (!selection) {
      quill.focus();
      return;
    }

    const url = prompt('Enter URL:');
    if (url) {
      quill.format('link', url);
    }
  }, [quillRef]);

  return (
    <div className={cn(
      "absolute top-[55%] -translate-y-[50%] left-2 flex flex-col gap-y-2 z-10",
      className
    )}>
      {/* Text Formatting */}
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <Hint label="Bold" side="right">
          <Button
            variant={activeFormats.bold ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyFormat('bold')}
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Italic" side="right">
          <Button
            variant={activeFormats.italic ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyFormat('italic')}
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Underline" side="right">
          <Button
            variant={activeFormats.underline ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyFormat('underline')}
            className="h-8 w-8"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Strikethrough" side="right">
          <Button
            variant={activeFormats.strike ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyFormat('strike')}
            className="h-8 w-8"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      {/* Headers */}
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <Hint label="Heading 1" side="right">
          <Button
            variant={activeFormats.header === 1 ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyHeader(1)}
            className="h-8 w-8"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Heading 2" side="right">
          <Button
            variant={activeFormats.header === 2 ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyHeader(2)}
            className="h-8 w-8"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Heading 3" side="right">
          <Button
            variant={activeFormats.header === 3 ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyHeader(3)}
            className="h-8 w-8"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      {/* Lists and Blocks */}
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <Hint label="Bullet List" side="right">
          <Button
            variant={activeFormats.list === 'bullet' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyList('bullet')}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Numbered List" side="right">
          <Button
            variant={activeFormats.list === 'ordered' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyList('ordered')}
            className="h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Quote" side="right">
          <Button
            variant={activeFormats.blockquote ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyFormat('blockquote')}
            className="h-8 w-8"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Code Block" side="right">
          <Button
            variant={activeFormats['code-block'] ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyFormat('code-block')}
            className="h-8 w-8"
          >
            <Code className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      {/* Alignment */}
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <Hint label="Align Left" side="right">
          <Button
            variant={!activeFormats.align || activeFormats.align === 'left' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyAlign('left')}
            className="h-8 w-8"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Align Center" side="right">
          <Button
            variant={activeFormats.align === 'center' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyAlign('center')}
            className="h-8 w-8"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Align Right" side="right">
          <Button
            variant={activeFormats.align === 'right' ? "secondary" : "ghost"}
            size="icon"
            onClick={() => applyAlign('right')}
            className="h-8 w-8"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      {/* Undo/Redo */}
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <Hint label="Undo" side="right">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-8 w-8"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        </Hint>
        
        <Hint label="Redo" side="right">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-8 w-8"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      {/* Link */}
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <Hint label="Insert Link" side="right">
          <Button
            variant={activeFormats.link ? "secondary" : "ghost"}
            size="icon"
            onClick={insertLink}
            className="h-8 w-8"
          >
            <Link className="h-4 w-4" />
          </Button>
        </Hint>
      </div>
    </div>
  );
};

export const NotesToolbarSkeleton = () => {
  return (
    <div
      className="absolute top-[55%] -translate-y-[50%] left-2 flex flex-col gap-y-2 bg-white h-[400px] w-[52px] shadow-md rounded-md"
      aria-hidden
    />
  );
};
