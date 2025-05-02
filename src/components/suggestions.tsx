'use client';

import { Sparkles } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useChannelId } from '@/hooks/use-channel-id';
import { useGetRecentChannelMessages } from '@/features/messages/api/use-get-recent-channel-messages';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { Button } from '@/components/ui/button';
import { Id } from '@/../convex/_generated/dataModel';

interface SuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
  // For channel context
  channelName?: string;
  // For direct message context
  conversationId?: Id<'conversations'>;
  memberName?: string;
}

// Fallback suggestions in case the API fails
const FALLBACK_SUGGESTIONS = [
  "I'll look into this and get back to you soon.",
  'Could we schedule a meeting to discuss this further?',
  'Thanks for sharing! This is really helpful.',
];

// Empty channel suggestions
const EMPTY_CHANNEL_SUGGESTIONS = [
  "Let's start a conversation!",
  "Hello team, how is everyone doing today?",
  "Any updates on our current projects?"
];

// Empty conversation suggestions
const EMPTY_CONVERSATION_SUGGESTIONS = [
  "Let's start a conversation!",
  "How can I help you today?",
  "What's on your mind?"
];

export const Suggestions = ({ 
  onSelectSuggestion, 
  channelName, 
  conversationId, 
  memberName 
}: SuggestionsProps) => {
  const channelId = useChannelId();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Determine if we're in a channel or direct message context
  const isDirectMessage = !!conversationId;

  // Get recent messages based on context
  const { data: channelMessages, isLoading: channelMessagesLoading } = useGetRecentChannelMessages({
    channelId,
    limit: 10,
    enabled: !isDirectMessage && !!channelId,
  });

  const { results: conversationMessages, status: conversationMessagesStatus } = useGetMessages({
    conversationId: conversationId as Id<'conversations'>,
  });

  // Function to fetch suggestions from the API - wrapped in useCallback to avoid dependency issues
  const fetchSuggestions = useCallback(async () => {
    // Handle direct messages
    if (isDirectMessage) {
      if (!conversationMessages || conversationMessages.length === 0) {
        setSuggestions(FALLBACK_SUGGESTIONS);
        return;
      }

      try {
        setIsLoading(true);

        // Validate message format before sending
        const validMessages = conversationMessages.filter(msg => {
          return msg && msg._id && msg.user?.name;
        });

        if (validMessages.length === 0) {
          setSuggestions(FALLBACK_SUGGESTIONS);
          setIsLoading(false);
          return;
        }

        // Format messages to match the expected API format
        const formattedMessages = validMessages.map(msg => ({
          id: msg._id,
          body: msg.body,
          authorName: msg.user?.name || 'Unknown',
          creationTime: msg._creationTime
        }));

        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: formattedMessages,
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
    } 
    // Handle channel messages
    else {
      if (!channelMessages || channelMessages.length === 0) {
        setSuggestions(FALLBACK_SUGGESTIONS);
        return;
      }

      try {
        setIsLoading(true);

        // Validate message format before sending
        const validMessages = channelMessages.filter(msg => {
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
            channelName
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
    }
  }, [isDirectMessage, conversationMessages, channelMessages, memberName, channelName]);

  // Track the most recent message ID to detect new messages
  useEffect(() => {
    if (isDirectMessage && conversationMessages && conversationMessages.length > 0) {
      const mostRecentMessageId = conversationMessages[0]._id;

      // If we have a new message, refresh suggestions
      if (lastMessageId !== null && lastMessageId !== mostRecentMessageId) {
        fetchSuggestions();
      }

      setLastMessageId(mostRecentMessageId);
    } else if (!isDirectMessage && channelMessages && channelMessages.length > 0) {
      const mostRecentMessageId = channelMessages[channelMessages.length - 1].id;

      // If we have a new message, refresh suggestions
      if (lastMessageId !== null && lastMessageId !== mostRecentMessageId) {
        fetchSuggestions();
      }

      setLastMessageId(mostRecentMessageId);
    }
  }, [isDirectMessage, conversationMessages, channelMessages, lastMessageId, fetchSuggestions]);

  // Initial fetch of suggestions when component mounts or context changes
  useEffect(() => {
    if (isDirectMessage && conversationId && conversationMessagesStatus !== 'LoadingFirstPage') {
      // Delay to ensure messages are fully loaded
      const timer = setTimeout(() => {
        if (conversationMessages && conversationMessages.length > 0) {
          fetchSuggestions();
        } else {
          // Empty conversation suggestions
          setSuggestions(EMPTY_CONVERSATION_SUGGESTIONS);
        }
      }, 1000); // Reduced delay to 1 second

      return () => clearTimeout(timer);
    } else if (!isDirectMessage && channelId && !channelMessagesLoading) {
      // Delay to ensure messages are fully loaded
      const timer = setTimeout(() => {
        if (channelMessages && channelMessages.length > 0) {
          fetchSuggestions();
        } else {
          // Empty channel suggestions
          setSuggestions(EMPTY_CHANNEL_SUGGESTIONS);
        }
      }, 1000); // Reduced delay to 1 second

      return () => clearTimeout(timer);
    }
  }, [
    isDirectMessage, 
    conversationId, 
    channelId, 
    conversationMessagesStatus, 
    channelMessagesLoading, 
    conversationMessages, 
    channelMessages, 
    fetchSuggestions
  ]);

  // Refresh suggestions manually
  const refreshSuggestions = () => {
    fetchSuggestions();
  };

  // Determine the context label
  const getContextLabel = () => {
    if (isDirectMessage && memberName) {
      return `AI suggestions for conversation with ${memberName}`;
    } else if (!isDirectMessage && channelName) {
      return `AI suggestions for #${channelName}`;
    } else {
      return 'AI message suggestions';
    }
  };

  return (
    <div className="mb-2 flex flex-col space-y-2 rounded-md border border-border/30 bg-muted/20 p-2">
      <div className="flex items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-tertiary" />
          <span>{getContextLabel()}</span>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:bg-tertiary/10 hover:text-tertiary"
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
              className="h-auto rounded-full border-tertiary/20 bg-tertiary/5 px-3 py-1 text-xs text-muted-foreground hover:bg-tertiary/10 hover:border-tertiary/30 hover:text-foreground"
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
