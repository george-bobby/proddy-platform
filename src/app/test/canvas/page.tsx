'use client';

import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { TestCanvasHeader } from '@/app/test/components/test-canvas-header';
import { TestCanvasToolbar } from '@/app/test/components/test-canvas-toolbar';
import { TestCanvasBoard } from '@/app/test/components/test-canvas-board';
import { TEST_CANVAS_ITEMS } from '@/app/test/data/shared-test-data';

export interface CanvasItem {
  id: string;
  type: 'text' | 'shape' | 'image' | 'note';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    fontSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasTool {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

const TestCanvasPage = () => {
  useDocumentTitle('Canvas');
  
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(TEST_CANVAS_ITEMS);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const handleItemUpdate = (itemId: string, updates: Partial<CanvasItem>) => {
    setCanvasItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
    ));
  };

  const handleItemCreate = (item: Omit<CanvasItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: CanvasItem = {
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  const handleItemDelete = (itemId: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== itemId));
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(200, newZoom)));
  };

  return (
    <div className="flex h-full flex-col">
      <TestCanvasHeader 
        zoom={zoom}
        onZoomChange={handleZoomChange}
        itemCount={canvasItems.length}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <TestCanvasToolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          selectedItem={canvasItems.find(item => item.id === selectedItemId)}
          onItemUpdate={handleItemUpdate}
        />
        
        <div className="flex-1 overflow-hidden">
          <TestCanvasBoard
            items={canvasItems}
            selectedTool={selectedTool}
            selectedItemId={selectedItemId}
            zoom={zoom}
            onItemSelect={setSelectedItemId}
            onItemUpdate={handleItemUpdate}
            onItemCreate={handleItemCreate}
            onItemDelete={handleItemDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCanvasPage;
