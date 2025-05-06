'use client';

import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Id } from '@/../convex/_generated/dataModel';

import { useCreateTask } from '../api/use-create-task';
import { TaskCategorySelector } from './task-category-selector';
import { TaskStatusSelector } from './task-status-selector';
import { TaskTagInput } from './task-tag-input';

interface TaskCreateFormProps {
  workspaceId: Id<'workspaces'>;
  onSuccess?: () => void;
}

export const TaskCreateForm = ({ workspaceId, onSuccess }: TaskCreateFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<Id<'categories'> | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await createTask({
        title,
        description: description || undefined,
        dueDate: dueDate ? dueDate.getTime() : undefined,
        priority,
        status: 'not_started',
        categoryId: categoryId || undefined,
        workspaceId,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setPriority(undefined);
      setCategoryId(null);

      if (onSuccess) {
        onSuccess();
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority(undefined);
    setCategoryId(null);
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-6 border-dashed bg-primary/70 text-white"
      >
        <Plus className="h-4 w-4" />
        <span>Add new task</span>
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-lg border shadow-md bg-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">New Task</h3>
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={handleCancel}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-medium"
          autoFocus
          required
        />
        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] resize-none"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : <span>Due date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Category (optional)</label>
          <TaskCategorySelector
            workspaceId={workspaceId}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-2 border-t">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || isSubmitting}>
          Create Task
        </Button>
      </div>
    </form>
  );
};
