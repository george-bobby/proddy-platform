'use client';

import { useEffect, useRef, memo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  CheckSquare
} from 'lucide-react';

interface CommandOption {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  quill: any;
  onImageClick: () => void;
}

export const CommandMenu = memo(({
  isOpen,
  onClose,
  position,
  quill,
  onImageClick
}: CommandMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const activeIndex = useRef<number>(0);

  // Close the menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.current = Math.min(activeIndex.current + 1, commandOptions.length - 1);
        highlightOption();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.current = Math.max(activeIndex.current - 1, 0);
        highlightOption();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(activeIndex.current);
      }
    };

    const highlightOption = () => {
      const options = menuRef.current?.querySelectorAll('.command-option');
      options?.forEach((option, index) => {
        if (index === activeIndex.current) {
          option.classList.add('bg-primary/10');
        } else {
          option.classList.remove('bg-primary/10');
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const executeCommand = (index: number) => {
    if (!quill) return;

    // Make sure the editor has focus
    quill.focus();

    // Get the current selection or create one at the end
    if (!quill.getSelection()) {
      quill.setSelection(quill.getLength() - 1, 0);
    }

    // Execute the command
    commandOptions[index].action();

    // Close the menu
    onClose();
  };

  const commandOptions: CommandOption[] = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: "Heading 1",
      description: "Large section heading",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle header format
        if (format.header === 1) {
          // If already header 1, remove it
          quill.format('header', false);
        } else {
          // Otherwise, set to header 1
          quill.format('header', 1);
        }
      }
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: "Heading 2",
      description: "Medium section heading",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle header format
        if (format.header === 2) {
          // If already header 2, remove it
          quill.format('header', false);
        } else {
          // Otherwise, set to header 2
          quill.format('header', 2);
        }
      }
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: "Heading 3",
      description: "Small section heading",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle header format
        if (format.header === 3) {
          // If already header 3, remove it
          quill.format('header', false);
        } else {
          // Otherwise, set to header 3
          quill.format('header', 3);
        }
      }
    },
    {
      icon: <Bold className="h-4 w-4" />,
      label: "Bold",
      description: "Make text bold",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle bold format
        quill.format('bold', !format.bold);
      }
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: "Italic",
      description: "Make text italic",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle italic format
        quill.format('italic', !format.italic);
      }
    },
    {
      icon: <Underline className="h-4 w-4" />,
      label: "Underline",
      description: "Underline text",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle underline format
        quill.format('underline', !format.underline);
      }
    },
    {
      icon: <List className="h-4 w-4" />,
      label: "Bullet List",
      description: "Create a bulleted list",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle bullet list format
        if (format.list === 'bullet') {
          quill.format('list', false);
        } else {
          quill.format('list', 'bullet');
        }
      }
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: "Numbered List",
      description: "Create a numbered list",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle ordered list format
        if (format.list === 'ordered') {
          quill.format('list', false);
        } else {
          quill.format('list', 'ordered');
        }
      }
    },
    {
      icon: <CheckSquare className="h-4 w-4" />,
      label: "To-do List",
      description: "Create a to-do list",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Insert a checkbox at the current position
        quill.insertText(selection.index, '☐ ', 'user');

        // Move cursor after the checkbox
        quill.setSelection(selection.index + 2, 0);
      }
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: "Quote",
      description: "Insert a quote block",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle blockquote format
        quill.format('blockquote', !format.blockquote);
      }
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: "Code",
      description: "Insert code block",
      action: () => {
        if (!quill) return;

        // Get current selection
        const selection = quill.getSelection();
        if (!selection) return;

        // Get current format
        const format = quill.getFormat(selection);

        // Toggle code-block format
        quill.format('code-block', !format['code-block']);
      }
    },
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: "Image",
      description: "Upload an image",
      action: () => {
        // Close the menu first to avoid UI issues
        onClose();
        // Then trigger the image upload
        setTimeout(() => {
          onImageClick();
        }, 100);
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 w-64 max-h-80 overflow-y-auto"
      style={{
        top: position.top + 20,
        left: position.left
      }}
    >
      <div className="p-2">
        <div className="text-xs font-medium text-gray-500 mb-2 px-2 pt-1">
          Basic blocks
        </div>
        {commandOptions.map((option, index) => (
          <div
            key={option.label}
            className={`flex items-start p-2 hover:bg-primary/10 rounded cursor-pointer command-option ${index === 0 ? 'bg-primary/10' : ''}`}
            onClick={() => executeCommand(index)}
            onMouseEnter={() => {
              activeIndex.current = index;
              const options = menuRef.current?.querySelectorAll('.command-option');
              options?.forEach((opt, idx) => {
                if (idx === index) {
                  opt.classList.add('bg-primary/10');
                } else {
                  opt.classList.remove('bg-primary/10');
                }
              });
            }}
          >
            <div className="mr-2 mt-0.5 text-gray-600">
              {option.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
