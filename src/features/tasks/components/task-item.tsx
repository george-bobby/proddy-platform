'use client';

import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, Edit, Pause, Play, Tag, Trash, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Id } from '@/../convex/_generated/dataModel';

import { useDeleteTask } from '../api/use-delete-task';
import { useGetTaskCategories } from '../api/use-get-task-categories';
import { useToggleTaskCompletion } from '../api/use-toggle-task-completion';
import { TaskEditForm } from './task-edit-form';

interface TaskItemProps {
  id: Id<'tasks'>;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: number;
  priority?: 'low' | 'medium' | 'high';
  categoryId?: Id<'categories'>;
  workspaceId: Id<'workspaces'>;
}

export const TaskItem = ({
  id,
  title,
  description,
  completed,
  dueDate,
  priority,
  categoryId,
  workspaceId,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const toggleCompletion = useToggleTaskCompletion();
  const deleteTask = useDeleteTask();
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: categories } = useGetTaskCategories({ workspaceId });

  const category = categories?.find(cat => cat._id === categoryId);

  const handleToggleCompletion = async () => {
    try {
      await toggleCompletion({ id });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTask({ id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPriorityLabel = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'None';
    }
  };

  const getStatusIcon = (completed: boolean) => {
    return completed
      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
      : <Circle className="h-4 w-4 text-gray-500" />;
  };

  if (isEditing) {
    return (
      <TaskEditForm
        id={id}
        workspaceId={workspaceId}
        initialTitle={title}
        initialDescription={description}
        initialDueDate={dueDate ? new Date(dueDate) : undefined}
        initialPriority={priority}
        initialCategoryId={categoryId}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={cn(
      "group p-4 rounded-lg border transition-all hover:shadow-md",
      completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-primary/30"
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleCompletion}
          className="mt-0.5 flex-shrink-0 focus:outline-none"
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {getStatusIcon(completed)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "font-medium text-sm truncate",
              completed && "line-through text-gray-500"
            )}>
              {title}
            </h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setIsEditing(true)}
                      className="h-7 w-7"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Category badge */}
          {category && (
            <div className="mt-1.5 mb-1">
              <Badge
                variant="outline"
                className="text-xs font-normal px-1.5 py-0"
                style={{ borderColor: category.color, color: category.color }}
              >
                {category.name}
              </Badge>
            </div>
          )}

          {description && (
            <p className={cn(
              "text-sm text-gray-600 mt-1 line-clamp-2",
              completed && "text-gray-400"
            )}>
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            {priority && (
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getPriorityColor(priority)
                )} />
                <span className="text-gray-600">{getPriorityLabel(priority)}</span>
              </div>
            )}

            {dueDate && (
              <div className={cn(
                "flex items-center gap-1.5",
                new Date(dueDate) < new Date() && !completed ? "text-red-500" : "text-gray-600"
              )}>
                <Clock className="h-3 w-3" />
                <span>{format(new Date(dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
