'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Id } from '@/../convex/_generated/dataModel';

import { useCreateTaskFromMessage } from '../api/use-create-task-from-message';
import { TaskCategorySelector } from './task-category-selector';

interface AddMessageToTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: Id<'messages'>;
  workspaceId: Id<'workspaces'>;
  messageContent: string;
}

export const AddMessageToTaskModal = ({
  isOpen,
  onClose,
  messageId,
  workspaceId,
  messageContent,
}: AddMessageToTaskModalProps) => {
  // Use the entire message content as the task title
  const extractTitle = (content: string): string => {
    return content;
  };

  // Form state
  const [title, setTitle] = useState(extractTitle(messageContent));
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>('medium');
  const [categoryId, setCategoryId] = useState<Id<'taskCategories'> | null>(null);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hook
  const createTaskFromMessage = useCreateTaskFromMessage();

  const createTask = async (quickAdd = false) => {
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);

      await createTaskFromMessage({
        messageId,
        workspaceId,
        title,
        dueDate: dueDate ? dueDate.getTime() : undefined,
        priority: quickAdd ? 'medium' : priority,
        categoryId: categoryId || undefined,
      });

      toast.success('Message added to tasks');
      handleClose();
    } catch (error) {
      console.error('Failed to create task from message:', error);
      toast.error('Failed to add message to tasks');
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async () => {
    await createTask(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask();
  };

  const handleClose = () => {
    setTitle(extractTitle(messageContent));
    setDueDate(undefined);
    setPriority('medium');
    setCategoryId(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Message to Tasks</DialogTitle>
            <DialogDescription>
              The message content will be used as the task title. You can set additional details below or use default settings.
            </DialogDescription>
          </DialogHeader>

          {/* Message preview */}
          <div className="mt-4 rounded-md border bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Message content (will be used as task title):</p>
            <p className="text-sm text-gray-700 font-medium">
              {messageContent}
            </p>
          </div>

          <div className="mt-4 space-y-4">

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <TaskCategorySelector
                workspaceId={workspaceId}
                value={categoryId}
                onChange={setCategoryId}
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex justify-start">
              <Button
                type="button"
                variant="secondary"
                onClick={handleQuickAdd}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Adding...' : 'Add with Default Settings'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add with Custom Settings'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
