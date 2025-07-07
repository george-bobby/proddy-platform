'use client';

import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import { ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import { Id } from '@/../convex/_generated/dataModel';
import { CommandMenu } from './command-menu';
import { cn } from '@/lib/utils';
import { useUpdateMyPresence } from '@/../liveblocks.config';

// Import Quill styles
import 'quill/dist/quill.snow.css';

interface NotePageProps {
  content: string;
  onContentChange: (content: string, isEnterKeyPress?: boolean) => void;
  onImageUpload?: (storageId: Id<'_storage'>) => void;
  isActive: boolean;
  pageIndex: number;
  quillRef?: React.MutableRefObject<any>;
}

export const NotePage = ({
  content,
  onContentChange,
  onImageUpload,
  isActive,
  pageIndex,
  quillRef: externalQuillRef,
}: NotePageProps) => {
  // Basic state
  const [isMounted, setIsMounted] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 });

  // Refs
  const internalQuillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  // Use internal ref for all operations
  const quillRef = internalQuillRef;

  // API hooks
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  // Liveblocks presence
  const updateMyPresence = useUpdateMyPresence();

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Quill editor - simplified approach
  useEffect(() => {
    if (!isMounted || !isActive || !containerRef.current) return;

    // Clean up any existing editor
    if (containerRef.current.querySelector('.ql-editor')) {
      containerRef.current.innerHTML = '';
    }

    // Enhanced configuration with better placeholder and formats
    const options = {
      modules: {
        toolbar: false,
        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true
        },
        keyboard: {
          bindings: {
            slash: {
              key: 191, // Forward slash key code
              shortKey: false,
              handler: function (range: any, context: any) {
                // This will be overridden later, but we need to register it here
                return true;
              }
            }
          }
        }
      },
      formats: [
        'bold', 'italic', 'underline', 'strike',
        'header', 'list', 'bullet', 'ordered',
        'blockquote', 'code-block', 'link', 'image',
        'color', 'background', 'indent', 'align'
      ],
      placeholder: "Write, press '/' for commands...",
      theme: 'snow',
    };

    // Create editor
    const editor = new Quill(containerRef.current, options);
    internalQuillRef.current = editor;

    // Also set the external ref if provided
    if (externalQuillRef) {
      externalQuillRef.current = editor;
    }

    // Set initial content with proper cursor positioning
    if (content) {
      try {
        const parsedContent = JSON.parse(content);

        // Disable the editor temporarily
        editor.enable(false);

        // Set content without triggering events
        editor.setContents(parsedContent, 'api');

        // Re-enable the editor
        editor.enable(true);

        // Position cursor at the end of content
        const length = editor.getLength();
        editor.setSelection(length - 1, 0);
      } catch (error) {
        editor.setText('');
      }
    } else {
      editor.setText('');
    }

    // Focus the editor and ensure cursor is visible
    setTimeout(() => {
      editor.focus();

      // Position cursor at the end of content
      const length = editor.getLength();
      if (length > 0) {
        editor.setSelection(length - 1, 0);
      }
    }, 100);

    // Combined text-change handler for both content updates and slash commands
    editor.on('text-change', function (delta, oldContents, source) {
      if (source !== 'user') return;

      // Update presence to show user is editing
      updateMyPresence({
        isEditing: true,
        lastActivity: Date.now()
      });

      // Get the current content
      const editorContent = editor.getContents();

      // Update content without affecting the cursor
      onContentChange(JSON.stringify(editorContent), false);

      // Check if the last character typed was a slash
      if (delta.ops && delta.ops.some(op =>
        typeof op.insert === 'string' && op.insert === '/'
      )) {
        console.log('Slash detected in text-change');
        // Get the current selection
        const selection = editor.getSelection();
        if (selection) {
          // Get the bounds of the cursor
          const bounds = editor.getBounds(selection.index);

          // Set the position for the command menu if bounds are available
          if (bounds) {
            setCommandMenuPosition({
              top: bounds.top,
              left: bounds.left
            });
          }

          // Open the command menu
          setIsCommandMenuOpen(true);

          // Delete the slash character
          editor.deleteText(selection.index - 1, 1, 'user');
        }
      }
    });

    // Direct keyboard binding for slash key
    editor.keyboard.addBinding({
      key: 191, // Forward slash key code
      handler: function (range) {
        console.log('Slash key pressed via keyboard binding');
        // Get the bounds of the cursor
        const bounds = editor.getBounds(range.index);

        // Set the position for the command menu if bounds are available
        if (bounds) {
          setCommandMenuPosition({
            top: bounds.top,
            left: bounds.left
          });
        }

        // Open the command menu
        setIsCommandMenuOpen(true);

        // Return true to prevent default handling
        return true;
      }
    });

    // Add blur event listener to stop editing presence
    editor.root.addEventListener('blur', function () {
      updateMyPresence({
        isEditing: false,
        lastActivity: Date.now()
      });
    });

    // Add focus event listener to start editing presence
    editor.root.addEventListener('focus', function () {
      updateMyPresence({
        isEditing: true,
        lastActivity: Date.now()
      });
    });

    // Add a keydown event listener to the editor element
    editor.root.addEventListener('keydown', function (e) {
      if (e.key === '/' || e.keyCode === 191) {
        console.log('Slash key detected via DOM event');
        // Get the current selection
        const selection = editor.getSelection();
        if (selection) {
          // Prevent default behavior
          e.preventDefault();

          // Get the bounds of the cursor
          const bounds = editor.getBounds(selection.index);

          // Set the position for the command menu if bounds are available
          if (bounds) {
            setCommandMenuPosition({
              top: bounds.top,
              left: bounds.left
            });
          }

          // Open the command menu
          setIsCommandMenuOpen(true);
        }
      }
    });

    // Cleanup
    return () => {
      if (editor && editor.root) {
        // Remove the keydown event listener
        editor.root.removeEventListener('keydown', function () { });
      }

      // Don't destroy the editor to prevent cursor issues
    };
  }, [isMounted, isActive, onContentChange]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!quillRef.current) return;

    try {
      const url = await generateUploadUrl({}, { throwError: true });
      if (!url) throw new Error('Failed to get upload URL');

      const result = await fetch(url, {
        method: 'POST',
        headers: { 'Content-type': file.type },
        body: file,
      });

      if (!result.ok) throw new Error('Upload failed');

      const { storageId } = await result.json();
      const imageUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;

      // Insert image
      const range = quillRef.current.getSelection(true);
      quillRef.current.insertEmbed(range.index, 'image', imageUrl);
      quillRef.current.setSelection(range.index + 1, 0);

      // Notify parent
      if (onImageUpload) {
        onImageUpload(storageId);
      }

      toast.success('Image uploaded');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  // Handle image button click
  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  // Handle command menu close
  const handleCloseCommandMenu = () => {
    setIsCommandMenuOpen(false);
  };

  // Handle slash command
  const handleSlashCommand = () => {
    if (quillRef.current) {
      // Focus the editor
      quillRef.current.focus();

      // Get the current selection
      const selection = quillRef.current.getSelection() || { index: 0, length: 0 };

      // Get the bounds of the cursor
      const bounds = quillRef.current.getBounds(selection.index);

      // Set the position for the command menu if bounds are available
      if (bounds) {
        setCommandMenuPosition({
          top: bounds.top,
          left: bounds.left
        });
      }

      // Open the command menu
      setIsCommandMenuOpen(true);

      console.log('Command menu opened via handleSlashCommand');
    }
  };

  // Add a global keyboard event listener for the slash key
  useEffect(() => {
    if (!isActive || !isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' || e.keyCode === 191) {
        console.log('Slash key detected in global keydown');
        if (quillRef.current && document.activeElement === quillRef.current.root) {
          handleSlashCommand();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col h-full relative border-b pb-8 mb-8",
      !isActive && "hidden"
    )}>
      <div className="flex-1">
        <div className="relative">
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileInputChange}
          />
          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleImageButtonClick}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <ImageIcon className="h-4 w-4" />
              Add image
            </button>

            <button
              onClick={handleSlashCommand}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <span className="h-4 w-4 flex items-center justify-center font-bold">/</span>
              Commands
            </button>
          </div>

          {/* Editor container */}
          <div
            ref={containerRef}
            className="min-h-[300px] border-0 transition-colors"
            onClick={(e) => {
              if (quillRef.current) {
                // Focus the editor
                quillRef.current.focus();

                // Get the click position relative to the editor
                const editorElement = quillRef.current.root;
                const rect = editorElement.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Convert click position to text position
                const index = quillRef.current.getSelection()?.index || 0;

                // Set selection at click position
                quillRef.current.setSelection(index, 0);
              }
            }}
            onKeyDown={(e) => {
              // Check for slash key
              if (e.key === '/' || e.keyCode === 191) {
                console.log('Slash key detected in container keydown');
                handleSlashCommand();
                e.preventDefault();
              }
            }}
          />

          {/* Command Menu */}
          <CommandMenu
            isOpen={isCommandMenuOpen}
            onClose={handleCloseCommandMenu}
            position={commandMenuPosition}
            quill={quillRef.current}
            onImageClick={handleImageButtonClick}
          />
        </div>
      </div>
    </div>
  );
};
