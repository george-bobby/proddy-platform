'use client';

import { useState, useEffect } from 'react';
import { Bold, Italic, List, Link, Image, Code, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  folder: string;
  isShared: boolean;
  collaborators: string[];
}

interface TestNotesEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
}

export const TestNotesEditor = ({ note, onUpdate }: TestNotesEditorProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  }, [note.id, note.title, note.content]);

  const handleSave = () => {
    onUpdate({
      title,
      content,
      updatedAt: new Date()
    });
    setIsEditing(false);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsEditing(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsEditing(true);
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('/test/')) {
      router.push(href);
    } else {
      window.open(href, '_blank');
    }
  };

  // Simple markdown-like rendering for display
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold mb-4 mt-6">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-semibold mb-3 mt-5">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-medium mb-2 mt-4">
            {line.substring(4)}
          </h3>
        );
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className="text-muted-foreground mt-1">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-muted-foreground font-medium">{match[1]}.</span>
              <span>{match[2]}</span>
            </div>
          );
        }
      }

      // Checkboxes
      if (line.includes('- [x]') || line.includes('- [ ]')) {
        const isChecked = line.includes('- [x]');
        const text = line.replace(/- \[[x ]\]\s/, '');
        return (
          <div key={index} className="flex items-start gap-2 mb-1">
            <span className={`text-sm ${isChecked ? 'text-green-600' : 'text-muted-foreground'}`}>
              {isChecked ? '✅' : '☐'}
            </span>
            <span className={isChecked ? 'line-through text-muted-foreground' : ''}>
              {text}
            </span>
          </div>
        );
      }

      // Links
      if (line.includes('[') && line.includes('](')) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(line)) !== null) {
          // Add text before the link
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }
          
          // Add the link
          parts.push(
            <button
              key={`link-${index}-${match.index}`}
              onClick={() => handleLinkClick(match[2])}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {match[1]}
            </button>
          );
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        return (
          <p key={index} className="mb-2">
            {parts}
          </p>
        );
      }

      // Bold text
      if (line.includes('**')) {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.substring(lastIndex, match.index));
          }
          parts.push(
            <strong key={`bold-${index}-${match.index}`}>
              {match[1]}
            </strong>
          );
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < line.length) {
          parts.push(line.substring(lastIndex));
        }

        return (
          <p key={index} className="mb-2">
            {parts}
          </p>
        );
      }

      // Horizontal rule
      if (line.trim() === '---') {
        return <hr key={index} className="my-6 border-border" />;
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={index} className="mb-2" />;
      }

      // Regular paragraph
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
            placeholder="Note title..."
          />
          
          {isEditing && (
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div>Created {note.createdAt.toLocaleDateString()}</div>
          <span>•</span>
          <div>Updated {note.updatedAt.toLocaleDateString()}</div>
          {note.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-1">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Edit Mode */}
        <div className="w-1/2 border-r">
          <div className="p-4 border-b">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Code className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="p-4">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your note..."
                className="min-h-[500px] border-none shadow-none resize-none focus-visible:ring-0"
              />
            </div>
          </ScrollArea>
        </div>

        {/* Preview Mode */}
        <div className="w-1/2">
          <div className="p-4 border-b">
            <h3 className="font-medium">Preview</h3>
          </div>
          <ScrollArea className="h-full">
            <div className="p-4 prose prose-sm max-w-none">
              {renderContent(content)}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
