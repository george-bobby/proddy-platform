'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash, ChevronLeft, ChevronRight, Plus, Minus, Calendar, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { format, addDays, startOfDay, endOfDay, differenceInDays, isSameDay, isWeekend } from 'date-fns';

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

  // State for date range
  const [startDate, setStartDate] = useState(() => {
    // Find earliest due date or default to today
    if (cardsWithDueDate.length > 0) {
      const dates = cardsWithDueDate.map(card => new Date(card.dueDate));
      const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      return startOfDay(earliest);
    }
    return startOfDay(new Date());
  });

  const [daysToShow, setDaysToShow] = useState(14);

  // Calculate end date based on start date and days to show
  const endDate = useMemo(() => {
    return endOfDay(addDays(startDate, daysToShow - 1));
  }, [startDate, daysToShow]);

  // Generate array of dates for the timeline
  const dateRange = useMemo(() => {
    const dates = [];
    let currentDate = startDate;

    while (differenceInDays(endDate, currentDate) >= 0) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  }, [startDate, endDate]);

  // Get priority color
  function getPriorityColor(priority: string | undefined) {
    switch (priority) {
      case 'highest':
        return 'bg-red-500/80';
      case 'high':
        return 'bg-orange-500/80';
      case 'medium':
        return 'bg-secondary/80';
      case 'low':
        return 'bg-blue-400/80';
      case 'lowest':
        return 'bg-primary/50';
      default:
        return 'bg-gray-300/80';
    }
  }

  function getPriorityTextColor(priority: string | undefined) {
    switch (priority) {
      case 'highest':
      case 'high':
      case 'medium':
        return 'text-white';
      default:
        return 'text-gray-800';
    }
  }

  // Navigation functions
  const goToPreviousPeriod = () => {
    setStartDate(addDays(startDate, -daysToShow));
  };

  const goToNextPeriod = () => {
    setStartDate(addDays(startDate, daysToShow));
  };

  const goToToday = () => {
    setStartDate(startOfDay(new Date()));
  };

  const zoomIn = () => {
    if (daysToShow > 7) {
      setDaysToShow(daysToShow - 7);
    }
  };

  const zoomOut = () => {
    setDaysToShow(daysToShow + 7);
  };

  // Update card due date mutation
  const updateCardInGantt = useMutation(api.board.updateCardInGantt);

  // Calculate task position and width in the timeline
  const getTaskPosition = (dueDate: number) => {
    const taskDate = new Date(dueDate);
    const daysDiff = differenceInDays(taskDate, startDate);

    // If the task is before the start date, it's off-screen
    if (daysDiff < 0) return { left: 0, visible: false };

    // If the task is after the end date, it's off-screen
    if (daysDiff >= daysToShow) return { left: 100, visible: false };

    // Calculate percentage position
    const left = (daysDiff / daysToShow) * 100;
    return { left, visible: true };
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with controls */}
      <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="text-sm font-medium text-muted-foreground">
          Showing {cardsWithDueDate.length} tasks with due dates across {lists.length} lists
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 flex items-center gap-1"
            onClick={goToToday}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Today</span>
          </Button>
          <div className="flex items-center rounded-md border overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-none border-r"
              onClick={goToPreviousPeriod}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-none border-r"
              onClick={goToNextPeriod}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-none border-r"
              onClick={zoomOut}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 rounded-none"
              onClick={zoomIn}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          {/* Timeline header */}
          <div className="sticky top-0 z-10 bg-white border-b">
            <div className="flex">
              <div className="w-64 min-w-64 border-r p-3 bg-gray-50 font-medium">
                Task / List
              </div>
              <div className="flex-1 flex">
                {dateRange.map((date, index) => (
                  <div
                    key={index}
                    className={`flex-1 text-center p-2 text-xs font-medium border-r
                      ${isToday(date) ? 'bg-primary/10' : isWeekend(date) ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <div className="font-semibold">{format(date, 'EEE')}</div>
                    <div className={`${isToday(date) ? 'text-primary font-bold' : ''}`}>
                      {format(date, 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt body */}
          <div>
            {lists.map(list => (
              <div key={list._id} className="border-b">
                {/* List header */}
                <div className="flex">
                  <div className="w-64 min-w-64 border-r p-3 font-medium bg-gray-50 flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span>{list.title}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({cardsWithDueDate.filter(card => card.listId === list._id).length})
                    </span>
                  </div>
                  <div className="flex-1 relative h-10">
                    {/* Today indicator */}
                    {dateRange.some(date => isToday(date)) && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-primary z-10"
                        style={{
                          left: `${(differenceInDays(new Date(), startDate) / daysToShow) * 100}%`,
                          height: '100%'
                        }}
                      ></div>
                    )}

                    {/* Weekend indicators */}
                    {dateRange.map((date, index) => (
                      isWeekend(date) && (
                        <div
                          key={index}
                          className="absolute top-0 bottom-0 bg-gray-50 h-full"
                          style={{
                            left: `${(index / daysToShow) * 100}%`,
                            width: `${(1 / daysToShow) * 100}%`
                          }}
                        ></div>
                      )
                    ))}
                  </div>
                </div>

                {/* Cards for this list */}
                {cardsWithDueDate
                  .filter(card => card.listId === list._id)
                  .map(card => {
                    const { left, visible } = getTaskPosition(card.dueDate);

                    if (!visible) return null;

                    return (
                      <div key={card._id} className="flex">
                        <div className="w-64 min-w-64 border-r p-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`}></div>
                          <span className="text-sm truncate">{card.title}</span>
                        </div>
                        <div className="flex-1 relative h-10 py-1">
                          <div
                            className={`absolute h-8 rounded-md shadow-sm flex items-center px-2 cursor-pointer
                              ${getPriorityColor(card.priority)} ${getPriorityTextColor(card.priority)}
                              hover:shadow-md transition-shadow`}
                            style={{
                              left: `${left}%`,
                              width: `${Math.max(5, Math.min(100 - left, 15))}%`
                            }}
                            onClick={() => onEditCard(card)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-medium truncate">{card.title}</span>
                              <div className="flex gap-1">
                                <Button
                                  size="iconSm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 opacity-80 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCard(card);
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="iconSm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 opacity-80 hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCard(card._id);
                                  }}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Empty state for lists with no cards */}
                {cardsWithDueDate.filter(card => card.listId === list._id).length === 0 && (
                  <div className="flex">
                    <div className="w-64 min-w-64 border-r p-2">
                      <span className="text-xs text-gray-500">No tasks with due dates</span>
                    </div>
                    <div className="flex-1 h-8"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardGanttView;
