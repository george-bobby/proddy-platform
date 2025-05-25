'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Mic, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SmartReply {
  id: string;
  text: string;
  context: string;
  confidence: number;
}

interface TestChatsInputProps {
  onSendMessage: (content: string, replyTo?: string) => void;
  smartReplies: SmartReply[];
  placeholder?: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  onCancelReply?: () => void;
}

export const TestChatsInput = ({
  onSendMessage,
  smartReplies,
  placeholder = "Type a message...",
  replyTo,
  onCancelReply,
}: TestChatsInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), replyTo?.id);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSmartReply = (reply: SmartReply) => {
    onSendMessage(reply.text, replyTo?.id);
    if (onCancelReply) {
      onCancelReply();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="border-t bg-background">
      {/* Smart Replies */}
      {smartReplies.length > 0 && (
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Smart Replies</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {smartReplies.map((reply) => (
              <TooltipProvider key={reply.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleSmartReply(reply)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-colors hover:scale-105",
                        getConfidenceColor(reply.confidence)
                      )}
                    >
                      {reply.text}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div>Context: {reply.context}</div>
                      <div>Confidence: {Math.round(reply.confidence * 100)}%</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                Replying to {replyTo.senderName}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 border-l-2 border-primary pl-2">
                {replyTo.content}
              </div>
            </div>
            {onCancelReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelReply}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              rows={1}
            />
            
            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice/Send Button */}
          {message.trim() ? (
            <Button onClick={handleSend} size="sm" className="flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex-shrink-0",
                isRecording && "bg-red-100 text-red-600"
              )}
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
              onMouseLeave={() => setIsRecording(false)}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Typing Indicator */}
        <div className="mt-2 text-xs text-muted-foreground">
          {isRecording && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Recording voice message...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
