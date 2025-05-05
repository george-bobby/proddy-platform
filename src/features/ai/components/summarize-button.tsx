'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { useMessageSelection } from '@/contexts/message-selection-context';
import { api } from "@/../convex/_generated/api";
import { useQuery } from "convex/react";
import { SummaryModal } from './summary-modal';

export const SummarizeButton = () => {
  const { selectedMessages, clearSelectedMessages } = useMessageSelection();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<{ summary: string; isCached: boolean } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch message content for each selected message - more efficiently
  const messageContents = useQuery(api.messages.getMessageBodies, {
    messageIds: selectedMessages.length > 0 ? selectedMessages : []
  });

  // Early return if no messages selected
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

      // Check if we have too many messages selected
      if (selectedMessages.length > 200) {
        toast.warning('Too many messages selected. Please select fewer messages for better summarization.', {
          duration: 5000,
        });
      }

      // Format messages with author names and timestamps
      const formattedMessages = messageContents.map(msg => ({
        body: msg.body,
        authorName: msg.authorName,
        creationTime: msg.creationTime
      }));

      // Show loading toast for better UX
      const loadingToast = toast.loading('Generating summary...', {
        duration: 10000,
      });

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: formattedMessages }),
        credentials: 'include',
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to summarize messages');
      }

      const data = await response.json();
      const summary = data.summary;

      // Set summary data and open modal
      setSummaryData({
        summary,
        isCached: !!data.cached
      });
      setIsModalOpen(true);

      // Show a small toast notification
      toast.success(data.cached ? 'Summary retrieved from cache' : 'Summary generated successfully');

      // Don't clear selected messages until modal is closed
    } catch (error) {
      console.error('Error summarizing messages:', error);
      toast.error('Failed to summarize messages. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    clearSelectedMessages();
  };

  return (
    <>
      {summaryData && (
        <SummaryModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          summary={summaryData.summary}
          messageCount={selectedMessages.length}
          isCached={summaryData.isCached}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-800">
          <span className="text-sm font-medium">
            {selectedMessages.length} {selectedMessages.length === 1 ? 'message' : 'messages'} selected
          </span>
          <Button
            onClick={handleSummarize}
            disabled={isSummarizing || !messageContents}
            className="bg-primary text-white hover:bg-primary/70"
            aria-label="Summarize selected messages"
          >
            <Sparkles className="mr-2 size-4" />
            {isSummarizing ? 'Summarizing...' : 'Summarize'}
          </Button>
        </div>
      </div>
    </>
  );
};
