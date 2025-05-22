'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader, Info, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Id } from '@/../convex/_generated/dataModel';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ReactMarkdown from 'react-markdown';
interface DashboardChatbotProps {
  workspaceId: Id<'workspaces'>;
  member: any;
}

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  sources?: Array<{
    id: string;
    type: string;
    text: string;
  }>;
};

export const DashboardChatbot = ({ workspaceId, member }: DashboardChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get workspace data
  const workspace = useQuery(api.workspaces.getById, { id: workspaceId });

  // Get chat history from Convex
  const chatHistory = useQuery(api.chatbot.getChatHistory, { workspaceId });

  // Convex mutations and actions
  const clearChatHistoryMutation = useMutation(api.chatbot.clearChatHistory);
  const generateResponseAction = useAction(api.chatbot.generateResponse);

  // Initialize messages from chat history
  useEffect(() => {
    if (chatHistory && !isInitialized) {
      if (chatHistory.messages && chatHistory.messages.length > 0) {
        // Convert Convex chat history to our Message format
        const formattedMessages = chatHistory.messages.map((msg, index) => ({
          id: index.toString(),
          content: msg.content,
          sender: msg.role,
          timestamp: new Date(msg.timestamp),
          sources: msg.sources ? msg.sources.map(source => ({
            id: source.id,
            type: source.type,
            text: source.text
          })) : undefined
        }));
        setMessages(formattedMessages);
      } else {
        // Set default welcome message if no history
        setMessages([{
          id: '1',
          content: "Hello! I'm your workspace assistant. How can I help you today?",
          sender: 'assistant',
          timestamp: new Date(),
        }]);
      }
      setIsInitialized(true);
    }
  }, [chatHistory, isInitialized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Store the message for later use
    const userQuery = input.trim();

    // Update UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to assistant:', userQuery);

      // Call the Convex action to generate a response
      const result = await generateResponseAction({
        workspaceId,
        message: userQuery,
      });

      // Validate response
      if (!result) {
        throw new Error('Empty response from assistant API');
      }

      if (result.error) {
        console.error('Error from assistant API:', result.error);
        throw new Error(result.error);
      }

      if (!result.response) {
        throw new Error('Missing response content from assistant API');
      }

      console.log('Received response from assistant');

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response,
        sender: 'assistant',
        timestamp: new Date(),
        sources: result.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chatbot:', error);

      // Extract error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error occurred';

      // Add fallback response with error details for better debugging
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm having trouble connecting right now. Please try again later. ${process.env.NODE_ENV === 'development' ? `(Error: ${errorMessage})` : ''
          }`,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);

      toast({
        title: 'Assistant Error',
        description: 'Failed to get a response from the assistant.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    try {
      await clearChatHistoryMutation({ workspaceId });

      // Reset UI messages
      setMessages([
        {
          id: Date.now().toString(),
          content: "Hello! I'm your workspace assistant. How can I help you today?",
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear conversation history.',
        variant: 'destructive',
      });
    }
  };

  // Helper function to render source badges
  const renderSourceBadges = (sources: Message['sources']) => {
    if (!sources || sources.length === 0) return null;

    // Group sources by type
    const sourcesByType: Record<string, number> = {};
    sources.forEach(source => {
      sourcesByType[source.type] = (sourcesByType[source.type] || 0) + 1;
    });

    return (
      <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
              <Info className="h-3 w-3 mr-1" />
              Sources
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sources used for this response:</h4>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {sources.map((source, index) => (
                  <div key={index} className="text-xs p-1.5 border-b">
                    <span className="font-semibold">{source.type.toUpperCase()}: </span>
                    <span>{source.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {Object.entries(sourcesByType).map(([type, count]) => (
          <Badge key={type} variant="outline" className="text-xs px-2 py-0.5">
            {type}: {count}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full shadow-md overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback>
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Proddy AI</CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="text-xs text-muted-foreground hover:text-destructive border border-gray-300"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[calc(100vh-240px)] px-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4 py-4 pb-10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                    }`}
                >
                  {message.sender === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-blockquote:my-2 prose-blockquote:pl-3 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-h2:text-primary prose-h3:text-primary/90 prose-h4:text-primary/80 prose-strong:font-semibold prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                  {message.sources && renderSourceBadges(message.sources)}
                  <p className="mt-2 text-right text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <div>
                      <p className="text-sm font-medium">Thinking...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Searching workspace content for relevant information
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-3 border-t mt-auto">
        <div className="flex w-full items-center gap-2">
          <Input
            placeholder="Ask a question about your workspace..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
