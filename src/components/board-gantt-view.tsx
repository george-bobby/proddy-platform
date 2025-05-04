'use client';

import React, { useState } from 'react';
import { Pencil, Trash, ChevronLeft, ChevronRight, Plus, Minus, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface BoardGanttViewProps {
  lists: any[];
  allCards: any[];
  onEditCard: (card: any) => void;
  onDeleteCard: (cardId: Id<'cards'>) => void;
}

const BoardGanttView: React.FC<BoardGanttViewProps> = ({
  lists,
  allCards,
  onEditCard,
  onDeleteCard
}) => {
  // Filter cards with due dates
  const cardsWithDueDate = allCards.filter(card => card.dueDate);

  // Get priority color
  function getPriorityColor(priority: string | undefined) {
    switch (priority) {
      case 'highest':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-secondary';
      case 'low':
        return 'bg-blue-400';
      case 'lowest':
        return 'bg-primary/50';
      default:
        return 'bg-gray-300';
    }
  }

  // Group cards by list
  const cardsByList = lists.reduce((acc, list) => {
    acc[list._id] = cardsWithDueDate.filter(card => card.listId === list._id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="text-sm font-medium text-muted-foreground">
          Showing {cardsWithDueDate.length} tasks with due dates across {lists.length} lists
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 flex items-center gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Today</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-6">
          {lists.map(list => (
            <div key={list._id} className="border rounded-md shadow-sm">
              <div className="bg-gray-50 p-3 font-medium border-b">
                {list.title} ({cardsByList[list._id]?.length || 0} tasks)
              </div>
              <div className="p-2">
                {cardsByList[list._id]?.length > 0 ? (
                  <div className="relative">
                    {/* Timeline header */}
                    <div className="flex border-b mb-2 pb-1">
                      <div className="w-1/3 font-medium text-sm">Task</div>
                      <div className="w-1/3 font-medium text-sm">Due Date</div>
                      <div className="w-1/3 font-medium text-sm">Actions</div>
                    </div>

                    {/* Timeline items */}
                    <div className="space-y-2">
                      {cardsByList[list._id].map(card => (
                        <div key={card._id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                          <div className="w-1/3 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`}></div>
                            <span className="text-sm font-medium truncate">{card.title}</span>
                          </div>
                          <div className="w-1/3 text-sm text-gray-600">
                            {new Date(card.dueDate).toLocaleDateString()}
                          </div>
                          <div className="w-1/3 flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onEditCard(card)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => onDeleteCard(card._id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No tasks with due dates in this list
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardGanttView;
