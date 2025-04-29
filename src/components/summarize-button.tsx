'use client';

import { useAction } from 'convex/react';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useMessageSelection } from '@/contexts/message-selection-context';

import { api } from '../../convex/_generated/api';

export const SummarizeButton = () => {
  const { selectedMessages, clearSelectedMessages } = useMessageSelection();
  const [isSummarizing, setIsSummarizing] = useState(false);

  const summarize = useAction(api.summarize.summarizeMessages);

  if (selectedMessages.length === 0) {
    return null;
  }

  const handleSummarize = async () => {
    if (selectedMessages.length === 0) {
      toast.error('Please select at least one message to summarize.');
      return;
    }

    try {
      setIsSummarizing(true);
      const summary = await summarize({ messageIds: selectedMessages });

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
      <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
        <span className="text-sm font-medium">
          {selectedMessages.length} {selectedMessages.length === 1 ? 'message' : 'messages'} selected
        </span>
        <Button onClick={handleSummarize} disabled={isSummarizing} className="bg-[#007a5a] text-white hover:bg-[#007a5a]/80">
          <Sparkles className="mr-2 size-4" />
          {isSummarizing ? 'Summarizing...' : 'Summarize'}
        </Button>
      </div>
    </div>
  );
};
