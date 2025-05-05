'use client';

import React, { useState } from 'react';
import { addMonths, format, getMonth, getYear, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader, Pencil, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { Id } from '@/../convex/_generated/dataModel';

interface BoardCalendarViewProps {
  lists: any[];
  allCards: any[];
  onEditCard: (card: any) => void;
  onDeleteCard: (cardId: Id<'cards'>) => void;
}

const BoardCalendarView: React.FC<BoardCalendarViewProps> = ({
  lists,
  allCards,
  onEditCard,
  onDeleteCard
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  // Filter cards with due dates
  const cardsWithDueDate = allCards.filter(card => card.dueDate);

  // Group cards by day
  const cardsByDay = cardsWithDueDate.reduce((acc, card) => {
    const day = new Date(card.dueDate).getDate();
    const month = new Date(card.dueDate).getMonth();
    const year = new Date(card.dueDate).getFullYear();

    // Only include cards from the current month being viewed
    if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(card);
    }
    return acc;
  }, {} as Record<number, any[]>);

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    if (!currentDate) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create an array of day objects
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true, cards: cardsByDay[day] || [] });
    }

    // Add empty cells to complete the last week if needed
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push({ day: null, isCurrentMonth: false });
      }
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get list title by list ID
  const getListTitle = (listId: Id<'lists'>) => {
    const list = lists.find(l => l._id === listId);
    return list ? list.title : 'Unknown List';
  };

  // Get priority color
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'highest':
        return 'bg-destructive/10 text-destructive border-l-2 border-destructive';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-l-2 border-orange-500';
      case 'medium':
        return 'bg-secondary/10 text-secondary border-l-2 border-secondary';
      case 'low':
        return 'bg-blue-400/10 text-blue-400 border-l-2 border-blue-400';
      case 'lowest':
        return 'bg-primary/10 text-primary/70 border-l-2 border-primary/30';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto overflow-x-hidden scrollbar-hide p-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <style jsx>{`
          ::-webkit-scrollbar {
            width: 0px;
            height: 0px;
            background: transparent;
            display: none;
          }
        `}</style>
        <div className="h-full rounded-md border">
          {/* Calendar header */}
          <div className="grid grid-cols-7 gap-px border-b bg-muted text-center">
            {weekdays.map((day) => (
              <div
                key={day}
                className="bg-background p-2 text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid h-[calc(100%-2rem)] grid-cols-7 grid-rows-6 gap-px bg-muted">
            {weeks.flat().map((dayObj, index) => (
              <div
                key={index}
                className={`relative bg-background p-1 ${dayObj.isCurrentMonth ? '' : 'text-muted-foreground opacity-50'
                  } ${dayObj.day &&
                    new Date().getDate() === dayObj.day &&
                    new Date().getMonth() === currentDate.getMonth() &&
                    new Date().getFullYear() === currentDate.getFullYear()
                    ? 'bg-accent'
                    : ''
                  }`}
              >
                {dayObj.day && (
                  <>
                    <div className="absolute right-1 top-1 text-xs">
                      {dayObj.day}
                    </div>
                    {dayObj.cards && dayObj.cards.length > 0 && (
                      <div className="mt-4 flex max-h-[80px] flex-col gap-1 overflow-y-auto">
                        {dayObj.cards.map((card: any) => (
                          <div
                            key={card._id}
                            className={`group relative rounded-sm p-1 text-[10px] leading-tight transition-colors ${getPriorityColor(card.priority)}`}
                          >
                            <div className="font-medium truncate">{card.title}</div>
                            <div className="text-[8px] text-muted-foreground">
                              {getListTitle(card.listId)}
                            </div>
                            <div className="absolute right-1 top-1 hidden group-hover:flex gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="iconSm"
                                      variant="ghost"
                                      className="h-4 w-4 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditCard(card);
                                      }}
                                    >
                                      <Pencil className="h-2.5 w-2.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit Card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="iconSm"
                                      variant="ghost"
                                      className="h-4 w-4 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteCard(card._id);
                                      }}
                                    >
                                      <Trash className="h-2.5 w-2.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete Card</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardCalendarView;
