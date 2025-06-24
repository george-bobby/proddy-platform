'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Id } from '../../../../convex/_generated/dataModel';

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  messageId?: Id<'messages'>;
}

interface ContextMenuContextType {
  contextMenu: ContextMenuState;
  openContextMenu: (x: number, y: number, messageId?: Id<'messages'>) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

interface ContextMenuProviderProps {
  children: ReactNode;
}

export const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      show: false,
      x: 0,
      y: 0,
    });
  }, []);

  // Close context menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        closeContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contextMenu.show) {
        closeContextMenu();
      }
    };

    const handleClearContextMenu = () => {
      closeContextMenu();
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    // Always listen for the clear context menu event
    document.addEventListener('clearContextMenu', handleClearContextMenu);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('clearContextMenu', handleClearContextMenu);
    };
  }, [contextMenu.show, closeContextMenu]);

  const openContextMenu = useCallback((x: number, y: number, messageId?: Id<'messages'>) => {
    // Close any existing context menu first
    if (contextMenu.show) {
      closeContextMenu();
      // Small delay to ensure the previous menu is closed before opening new one
      setTimeout(() => {
        openNewContextMenu(x, y, messageId);
      }, 10);
    } else {
      openNewContextMenu(x, y, messageId);
    }
  }, [contextMenu.show, closeContextMenu]);

  const openNewContextMenu = useCallback((x: number, y: number, messageId?: Id<'messages'>) => {
    // Calculate menu dimensions (approximate)
    const menuWidth = 160;
    const menuHeight = 200;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position to keep menu within viewport
    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position if menu would go off-screen
    if (adjustedX + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10; // 10px margin from edge
    }

    // Adjust vertical position if menu would go off-screen
    if (adjustedY + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10; // 10px margin from edge
    }

    // Ensure minimum distance from edges
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);

    setContextMenu({
      show: true,
      x: adjustedX,
      y: adjustedY,
      messageId,
    });
  }, []);



  return (
    <ContextMenuContext.Provider
      value={{
        contextMenu,
        openContextMenu,
        closeContextMenu,
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
