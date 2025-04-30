'use client';

import { Sparkles } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { Button } from '@/components/ui/button';
import { Id } from '@/../convex/_generated/dataModel';

interface DirectMessageSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
  conversationId: Id<'conversations'>;
  memberName?: string; // Optional member name to provide context
}

// Fallback suggestions in case the API fails
const FALLBACK_SUGGESTIONS = [
  "I'll look into this and get back to you soon.",
  'Could we schedule a meeting to discuss this further?',
  'Thanks for sharing! This is really helpful.',
];

export const DirectMessageSuggestions = ({ onSelectSuggestion, conversationId, memberName }: DirectMessageSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Get recent messages for the current conversation
  const { results: recentMessages, status: messagesStatus } = useGetMessages({
    conversationId,
  });

  // Function to fetch suggestions from the API - wrapped in useCallback to avoid dependency issues
  const fetchSuggestions = useCallback(async () => {
    if (!recentMessages || recentMessages.length === 0) {
      setSuggestions(FALLBACK_SUGGESTIONS);
      return;
    }

    try {
      setIsLoading(true);

      // Validate message format before sending
      const validMessages = recentMessages.filter(msg => {
        return msg && msg.id && msg.authorName;
      });

      if (validMessages.length === 0) {
        setSuggestions(FALLBACK_SUGGESTIONS);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: validMessages,
          memberName
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status}`);
      }

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(FALLBACK_SUGGESTIONS);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions(FALLBACK_SUGGESTIONS);
    } finally {
      setIsLoading(false);
    }
  }, [recentMessages, memberName]);

  // Track the most recent message ID to detect new messages
  useEffect(() => {
    if (recentMessages && recentMessages.length > 0) {
      const mostRecentMessageId = recentMessages[0].id;

      // If we have a new message, refresh suggestions
      if (lastMessageId !== null && lastMessageId !== mostRecentMessageId) {
        fetchSuggestions();
      }

      setLastMessageId(mostRecentMessageId);
    }
  }, [recentMessages, lastMessageId, fetchSuggestions]);

  // Initial fetch of suggestions when component mounts or conversation changes
  useEffect(() => {
    if (conversationId && messagesStatus !== 'LoadingFirstPage') {
      // Delay to ensure messages are fully loaded
      const timer = setTimeout(() => {
        if (recentMessages && recentMessages.length > 0) {
          fetchSuggestions();
        } else {
          // Empty conversation suggestions
          setSuggestions([
            "Let's start a conversation!",
            "How can I help you today?",
            "What's on your mind?"
          ]);
        }
      }, 1000); // Reduced delay to 1 second

      return () => clearTimeout(timer);
    }
  }, [conversationId, messagesStatus, recentMessages, fetchSuggestions]);

  // Refresh suggestions manually
  const refreshSuggestions = () => {
    fetchSuggestions();
  };

  return (
    <div className="mb-2 flex flex-col space-y-2 rounded-md border border-border/30 bg-muted/20 p-2">
      <div className="flex items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-blue-500" />
          <span>
            {memberName
              ? `AI suggestions for conversation with ${memberName}`
              : 'AI message suggestions'}
          </span>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500"
            onClick={refreshSuggestions}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto rounded-full border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs text-muted-foreground hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-foreground"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))
        ) : (
          <div className="w-full text-center text-xs text-muted-foreground">
            {isLoading ? 'Generating suggestions...' : 'No suggestions available'}
          </div>
        )}
      </div>
    </div>
  );
};
