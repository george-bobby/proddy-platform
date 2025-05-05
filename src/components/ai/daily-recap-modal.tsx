'use client';

import { Sparkles, Copy, Check, X, Download, FileText, FileJson } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DailyRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  recap: string;
  date: string;
  messageCount: number;
  isCached?: boolean;
}

export const DailyRecapModal = ({ isOpen, onClose, recap, date, messageCount, isCached = false }: DailyRecapModalProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : '';

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(recap);
    setIsCopied(true);
    toast.success('Recap copied to clipboard');

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([recap], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-recap-${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  const handleExportJSON = () => {
    const jsonData = {
      date: date,
      messageCount: messageCount,
      content: recap,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-recap-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON');
  };

  const handleExportText = () => {
    // Convert markdown to plain text (simple conversion)
    const plainText = recap
      .replace(/#{1,6}\s?([^\n]+)/g, '$1\n') // headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
      .replace(/\*([^*]+)\*/g, '$1') // italic
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)') // links
      .replace(/>\s?([^\n]+)/g, '  $1\n') // blockquotes
      .replace(/- ([^\n]+)/g, '• $1') // bullet points
      .replace(/\n\n/g, '\n'); // extra newlines
    
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-recap-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported as Text');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span>
                {isCached ? 'Cached Daily Recap' : 'Daily Recap'}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({messageCount} {messageCount === 1 ? 'message' : 'messages'})
                </span>
              </span>
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isCached
              ? 'This recap was retrieved from cache for faster results.'
              : `AI-generated recap of conversations from ${formattedDate}.`}
          </p>
        </div>

        {/* Content */}
        <div className="mt-2 rounded-md border bg-muted/50 p-4 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-blockquote:my-2 prose-blockquote:pl-3 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
            <ReactMarkdown>{recap}</ReactMarkdown>
          </div>
        </div>

        {/* Footer with export options */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex items-center gap-1 text-xs"
              size="sm"
            >
              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              onClick={handleExportMarkdown}
              variant="outline"
              className="flex items-center gap-1 text-xs"
              size="sm"
            >
              <FileText className="h-3 w-3" />
              Export MD
            </Button>
            <Button
              onClick={handleExportText}
              variant="outline"
              className="flex items-center gap-1 text-xs"
              size="sm"
            >
              <FileText className="h-3 w-3" />
              Export TXT
            </Button>
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="flex items-center gap-1 text-xs"
              size="sm"
            >
              <FileJson className="h-3 w-3" />
              Export JSON
            </Button>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-xs"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
