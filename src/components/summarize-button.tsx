'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useMessageSelection } from '@/contexts/message-selection-context';

export const SummarizeButton = () => {
  const { selectedMessages, clearSelectedMessages } = useMessageSelection();
  const [isSummarizing, setIsSummarizing] = useState(false);

  if (selectedMessages.length === 0) {
    return null;
  }

  const handleSummarize = async () => {
    try {
      setIsSummarizing(true);

      // TODO: Replace with actual API call to your summarization endpoint
      // Example implementation (placeholder):
      // const response = await fetch('/api/summarize', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ messageIds: selectedMessages }),
      // });
      // const data = await response.json();
      // const summary = data.summary;

      // For now, using a placeholder summary
      const summary = `Summary of ${selectedMessages.length} selected messages. Implement the actual summarization logic by creating an API endpoint at /api/summarize/route.ts`;

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
          disabled={isSummarizing}
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
