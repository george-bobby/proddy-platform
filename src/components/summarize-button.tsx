'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { useMessageSelection } from '@/contexts/message-selection-context';
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

export const SummarizeButton = () => {
  const { selectedMessages, clearSelectedMessages } = useMessageSelection();
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Fetch message content for each selected message
  const messageContents = useQuery(api.messages.getMessageBodies, {
    messageIds: selectedMessages
  });

  if (selectedMessages.length === 0) {
    return null;
  }

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);

      // If we're still loading message contents, show a message
      if (!messageContents) {
        toast.error('Loading message content, please try again in a moment');
        setIsSummarizing(false);
        return;
      }

      // Format messages with author names and timestamps
      const formattedMessages = messageContents.map(msg => ({
        body: msg.body,
        authorName: msg.authorName,
        creationTime: msg.creationTime
      }));

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: formattedMessages }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to summarize messages');
      }

      const data = await response.json();
      const summary = data.summary;

      toast.success('Messages summarized successfully!', {
        description: summary,
        duration: 10000,
      });

      clearSelectedMessages();
    } catch (error) {
      console.error('Error summarizing messages:', error);
      toast.error('Failed to summarize messages. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-800">
        <span className="text-sm font-medium">
          {selectedMessages.length} {selectedMessages.length === 1 ? 'message' : 'messages'} selected
        </span>
        <Button
          onClick={handleSummarize}
          disabled={isSummarizing || !messageContents}
          className="bg-[#007a5a] text-white hover:bg-[#007a5a]/80"
          aria-label="Summarize selected messages"
        >
          <Sparkles className="mr-2 size-4" />
          {isSummarizing ? 'Summarizing...' : 'Summarize'}
        </Button>
      </div>
    </div>
  );
};
