'use client';

import { useState } from 'react';
import { ContextMenuProvider, useContextMenu } from '../contexts/context-menu-context';

// Demo component to show context menu functionality
const DemoMessage = ({ id, content }: { id: string; content: string }) => {
  const { openContextMenu } = useContextMenu();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, id as any);
  };

  return (
    <div
      className="p-4 m-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
      onContextMenu={handleContextMenu}
    >
      <p className="text-sm text-gray-600">Message ID: {id}</p>
      <p>{content}</p>
      <p className="text-xs text-gray-500 mt-2">Right-click to open context menu</p>
    </div>
  );
};

const DemoContextMenu = () => {
  const { contextMenu, closeContextMenu } = useContextMenu();

  if (!contextMenu.show) return null;

  return (
    <div
      className="fixed bg-white border rounded-lg shadow-lg py-1 z-[9999] min-w-[160px]"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
    >
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
        onClick={() => {
          console.log('Copy action for message:', contextMenu.messageId);
          closeContextMenu();
        }}
      >
        Copy Message
      </button>
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
        onClick={() => {
          console.log('Edit action for message:', contextMenu.messageId);
          closeContextMenu();
        }}
      >
        Edit Message
      </button>
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
        onClick={() => {
          console.log('Delete action for message:', contextMenu.messageId);
          closeContextMenu();
        }}
      >
        Delete Message
      </button>
    </div>
  );
};

// Main demo component
export const ContextMenuDemo = () => {
  const messages = [
    { id: 'msg-1', content: 'Hello! This is the first message.' },
    { id: 'msg-2', content: 'This is another message. Try right-clicking on different messages.' },
    { id: 'msg-3', content: 'Notice how only one context menu can be open at a time!' },
  ];

  return (
    <ContextMenuProvider>
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Context Menu Demo</h2>
        <p className="text-gray-600 mb-4">
          Right-click on any message below. Notice that opening a new context menu 
          automatically closes any previously opened menu.
        </p>
        
        {messages.map((message) => (
          <DemoMessage key={message.id} id={message.id} content={message.content} />
        ))}
        
        <DemoContextMenu />
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Key Features:</h3>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Only one context menu open at a time</li>
            <li>• Automatic positioning within viewport</li>
            <li>• Click outside to close</li>
            <li>• Global state management</li>
          </ul>
        </div>
      </div>
    </ContextMenuProvider>
  );
};
