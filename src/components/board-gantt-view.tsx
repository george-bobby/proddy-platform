'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Calendar,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  differenceInDays,
  isWithinInterval,
  startOfDay,
  endOfDay
} from 'date-fns';

interface BoardGanttViewProps {
  lists: any[];
  allCards: any[];
  onEditCard: (card: any) => void;
  onDeleteCard: (cardId: Id<'cards'>) => void;
}

// Define a type for our task items
interface GanttTask {
  id: Id<'cards'>;
  title: string;
  startDate: Date;
  endDate: Date;
  priority?: string;
  listId: Id<'lists'>;
  listTitle: string;
  description?: string;
  labels?: string[];
  originalCard: any;
}

const BoardGanttView: React.FC<BoardGanttViewProps> = ({
  lists,
  allCards,
  onEditCard,
  onDeleteCard
}) => {
  // State for timeline controls
  const [currentStartDate, setCurrentStartDate] = useState<Date>(() => {
    // Find the earliest due date or default to today
    const earliestDueDate = allCards
      .filter(card => card.dueDate)
      .reduce((earliest, card) => {
        const dueDate = new Date(card.dueDate);
        return earliest === null || dueDate < earliest ? dueDate : earliest;
      }, null as Date | null);

    return earliestDueDate ? startOfWeek(earliestDueDate) : startOfWeek(new Date());
  });

  const [zoomLevel, setZoomLevel] = useState<number>(14); // Number of days to show
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);

  // Process cards into Gantt tasks
  const tasks = useMemo(() => {
    return allCards
      .filter(card => card.dueDate)
      .map(card => {
        const list = lists.find(l => l._id === card.listId);
        const dueDate = new Date(card.dueDate);

        // For simplicity, we'll set the start date to 3 days before the due date
        // In a real app, you might have actual start dates stored
        const startDate = new Date(dueDate);
        startDate.setDate(startDate.getDate() - 3);

        return {
          id: card._id,
          title: card.title,
          startDate,
          endDate: dueDate,
          priority: card.priority,
          listId: card.listId,
          listTitle: list ? list.title : 'Unknown List',
          description: card.description,
          labels: card.labels,
          originalCard: card
        } as GanttTask;
      });
  }, [allCards, lists]);

  // Generate the dates for our timeline
  const timelineDates = useMemo(() => {
    const endDate = addDays(currentStartDate, zoomLevel - 1);
    return eachDayOfInterval({ start: currentStartDate, end: endDate });
  }, [currentStartDate, zoomLevel]);

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

  function getPriorityTextColor(priority: string | undefined) {
    switch (priority) {
      case 'highest':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-secondary';
      case 'low':
        return 'text-blue-400';
      case 'lowest':
        return 'text-primary';
      default:
        return 'text-gray-500';
    }
  }

  // Group tasks by list
  const tasksByList = lists.reduce((acc, list) => {
    acc[list._id] = tasks.filter(task => task.listId === list._id);
    return acc;
  }, {} as Record<string, GanttTask[]>);

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentStartDate(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentStartDate(prev => addWeeks(prev, 1));
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.max(7, prev - 7));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.min(28, prev + 7));
  };

  // Calculate task position and width on the timeline
  const getTaskPosition = (task: GanttTask) => {
    const timelineStart = startOfDay(currentStartDate);
    const timelineEnd = endOfDay(addDays(currentStartDate, zoomLevel - 1));

    // Check if task is within our visible timeline
    const taskStartsBeforeTimeline = task.startDate < timelineStart;
    const taskEndsAfterTimeline = task.endDate > timelineEnd;

    // Calculate start position
    const startPosition = taskStartsBeforeTimeline
      ? 0
      : (differenceInDays(task.startDate, timelineStart) / zoomLevel) * 100;

    // Calculate width
    let width;
    if (taskStartsBeforeTimeline && taskEndsAfterTimeline) {
      width = 100; // Task spans the entire visible timeline
    } else if (taskStartsBeforeTimeline) {
      width = (differenceInDays(task.endDate, timelineStart) + 1) / zoomLevel * 100;
    } else if (taskEndsAfterTimeline) {
      width = (differenceInDays(timelineEnd, task.startDate) + 1) / zoomLevel * 100;
    } else {
      width = (differenceInDays(task.endDate, task.startDate) + 1) / zoomLevel * 100;
    }

    // Ensure minimum width for visibility
    width = Math.max(width, 3);

    return {
      left: `${startPosition}%`,
      width: `${width}%`,
      display: isWithinInterval(task.startDate, { start: timelineStart, end: timelineEnd }) ||
        isWithinInterval(task.endDate, { start: timelineStart, end: timelineEnd }) ||
        (task.startDate <= timelineStart && task.endDate >= timelineEnd)
        ? 'block' : 'none'
    };
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Gantt Chart Controls */}
      <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="text-sm font-medium text-muted-foreground">
          Showing {tasks.length} tasks with due dates across {lists.length} lists
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
              onClick={goToPreviousWeek}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="px-2 text-xs font-medium border-l border-r">
              {format(currentStartDate, 'MMM d')} - {format(addDays(currentStartDate, zoomLevel - 1), 'MMM d, yyyy')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
              onClick={goToNextWeek}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center border rounded-md overflow-hidden ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
              onClick={zoomOut}
              disabled={zoomLevel >= 28}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="px-2 text-xs font-medium border-l border-r">
              {zoomLevel} days
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-none"
              onClick={zoomIn}
              disabled={zoomLevel <= 7}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 flex items-center gap-1"
            onClick={() => setCurrentStartDate(startOfWeek(new Date()))}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Today</span>
          </Button>
        </div>
      </div>

      {/* Gantt Chart Content */}
      <div className="flex-1 overflow-auto">
        {/* Timeline Header */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex pl-[250px]">
            {timelineDates.map((date, index) => (
              <div
                key={index}
                className="flex-1 text-center py-2 text-xs font-medium border-r last:border-r-0"
                style={{ minWidth: '60px' }}
              >
                <div className="text-muted-foreground">{format(date, 'EEE')}</div>
                <div className={`${isSameDay(date, new Date()) ? 'bg-primary/10 text-primary rounded-full px-2 py-0.5 inline-block' : ''}`}>
                  {format(date, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Chart Body */}
        <div className="relative">
          {/* List rows with tasks */}
          {lists.map(list => (
            <div key={list._id} className="border-b last:border-b-0">
              <div className="flex">
                {/* List name column */}
                <div className="w-[250px] sticky left-0 bg-white z-10 border-r p-3 flex flex-col justify-center">
                  <div className="font-medium truncate">{list.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {tasksByList[list._id]?.length || 0} tasks
                  </div>
                </div>

                {/* Timeline grid */}
                <div className="flex-1 relative min-h-[100px]">
                  {/* Background grid lines */}
                  <div className="absolute inset-0 flex">
                    {timelineDates.map((date, index) => (
                      <div
                        key={index}
                        className={`flex-1 border-r last:border-r-0 ${isSameDay(date, new Date()) ? 'bg-primary/5' : index % 2 === 0 ? 'bg-gray-50' : ''}`}
                        style={{ minWidth: '60px' }}
                      ></div>
                    ))}
                  </div>

                  {/* Tasks for this list */}
                  <div className="relative p-2">
                    {tasksByList[list._id]?.map(task => {
                      const style = getTaskPosition(task);
                      return (
                        <div
                          key={task.id}
                          className="mb-2 relative"
                          style={{ height: '30px' }}
                        >
                          <div
                            className={`absolute top-0 h-full rounded-md border shadow-sm cursor-pointer transition-all hover:shadow-md ${getPriorityColor(task.priority).replace('bg-', 'bg-opacity-20 border-')}`}
                            style={{
                              ...style,
                              backgroundColor: getPriorityColor(task.priority).replace('bg-', '').replace('500', '100').replace('400', '100')
                            }}
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}></div>
                              <span className="ml-1 text-xs font-medium truncate">{task.title}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Details Sidebar */}
      {selectedTask && (
        <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-white border-l shadow-lg p-4 overflow-y-auto z-20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold truncate">{selectedTask.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedTask(null)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">List</div>
              <div className="text-sm font-medium">{selectedTask.listTitle}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Timeline</div>
              <div className="text-sm">
                {format(selectedTask.startDate, 'MMM d')} - {format(selectedTask.endDate, 'MMM d, yyyy')}
              </div>
            </div>

            {selectedTask.priority && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Priority</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityTextColor(selectedTask.priority)} bg-opacity-10 ${getPriorityColor(selectedTask.priority).replace('bg-', 'bg-')}`}>
                  <div className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(selectedTask.priority)}`}></div>
                  {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                </div>
              </div>
            )}

            {selectedTask.description && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Description</div>
                <div className="text-sm">{selectedTask.description}</div>
              </div>
            )}

            {selectedTask.labels && selectedTask.labels.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Labels</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTask.labels.map((label, index) => (
                    <span key={index} className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onEditCard(selectedTask.originalCard)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onDeleteCard(selectedTask.id);
                  setSelectedTask(null);
                }}
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center flex-col p-8">
          <div className="bg-gray-50 rounded-full p-3 mb-3">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No tasks with due dates</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Add due dates to your cards to see them in the Gantt chart view.
          </p>
        </div>
      )}
    </div>
  );
};

export default BoardGanttView;
