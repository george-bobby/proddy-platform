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

  const getPriorityStyles = (value: string) => {
    switch (value) {
      case 'high':
        return {
          icon: <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />,
          label: 'High Priority'
        };
      case 'medium':
        return {
          icon: <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />,
          label: 'Medium Priority'
        };
      case 'low':
        return {
          icon: <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />,
          label: 'Low Priority'
        };
      default:
        return {
          icon: <div className="h-3 w-3 rounded-full border-2 border-dashed border-gray-300 mr-2" />,
          label: 'Set Priority (optional)'
        };
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="default"
        className="w-full flex items-center justify-center gap-2 py-6 bg-primary hover:bg-primary-600 text-white shadow-md hover:shadow-lg transition-all relative overflow-hidden group"
      >
        <span className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute right-0 bottom-0 size-16 rounded-full -translate-x-5 translate-y-5 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute size-4 rounded-full bg-white/30 animate-ping"></span>
        <Plus className="h-5 w-5" />
        <span className="font-semibold text-base">Add new task</span>
      </Button>
    );
  }

  const priorityStyles = getPriorityStyles(priority || '');

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl border shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        {/* <h3 className="font-semibold text-lg text-gray-800">Create a new task</h3> */}
        <Button
          type="button"
          variant="ghost"
          size="iconSm"
          onClick={handleCancel}
          className="h-8 w-8 rounded-full hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-base font-medium border-gray-300 focus-visible:ring-primary"
          autoFocus
          required
        />

        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none border-gray-300 focus-visible:ring-primary text-gray-700"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300",
                    !dueDate ? "text-gray-500" : "text-gray-800"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {dueDate ? format(dueDate, 'PPP') : <span>Due date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="border rounded-md shadow-md"
                />
                {dueDate && (
                  <div className="p-2 border-t flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDueDate(undefined)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Set Priority (optional)">
                  <div className="flex items-center">
                    {priorityStyles.icon}
                    {priorityStyles.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                    High Priority
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                    Medium Priority
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                    Low Priority
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <label className="text-sm font-medium block mb-2 text-gray-700">Category (optional)</label>
          <TaskCategorySelector
            workspaceId={workspaceId}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-5 mt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="border-gray-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="bg-primary hover:bg-primary-600"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
