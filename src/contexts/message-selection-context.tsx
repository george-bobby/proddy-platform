'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Id } from '../../convex/_generated/dataModel';

interface MessageSelectionContextType {
  selectedMessages: Id<'messages'>[];
  toggleMessageSelection: (id: Id<'messages'>) => void;
  clearSelectedMessages: () => void;
  isMessageSelected: (id: Id<'messages'>) => boolean;
}

const MessageSelectionContext = createContext<MessageSelectionContextType | undefined>(undefined);

export const MessageSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMessages, setSelectedMessages] = useState<Id<'messages'>[]>([]);

  const toggleMessageSelection = (id: Id<'messages'>) => {
    setSelectedMessages((prev) => {
      if (prev.includes(id)) {
        return prev.filter((messageId) => messageId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const clearSelectedMessages = () => {
    setSelectedMessages([]);
  };

  const isMessageSelected = (id: Id<'messages'>) => {
    return selectedMessages.includes(id);
  };

  return (
    <MessageSelectionContext.Provider
      value={{
        selectedMessages,
        toggleMessageSelection,
        clearSelectedMessages,
        isMessageSelected,
      }}
    >
      {children}
    </MessageSelectionContext.Provider>
  );
};

export const useMessageSelection = () => {
  const context = useContext(MessageSelectionContext);
  if (context === undefined) {
    throw new Error('useMessageSelection must be used within a MessageSelectionProvider');
  }
  return context;
};
