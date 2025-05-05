'use client';

import { isAfter, isBefore, isToday, startOfDay } from 'date-fns';
import { CheckSquare, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceToolbar } from '../toolbar';

import { useGetTaskCategories } from '@/features/tasks/api/use-get-task-categories';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { TaskCreateForm } from '@/features/tasks/components/task-create-form';
import { TaskFilter, TaskFilterOptions } from '@/features/tasks/components/task-filter';
import { TaskItem } from '@/features/tasks/components/task-item';

const TasksPage = () => {
  const workspaceId = useWorkspaceId();
  const { data: tasks, isLoading } = useGetTasks({ workspaceId });
  const { data: categories, isLoading: categoriesLoading } = useGetTaskCategories({ workspaceId });
  const { toast } = useToast();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [filterOptions, setFilterOptions] = useState<TaskFilterOptions>({
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    categoryId: null,
    tags: [] as string[],
    sortBy: 'created',
    sortDirection: 'desc',
    view: 'list',
  });

  // Handle filter changes
  const handleFilterChange = useCallback((options: Partial<TaskFilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...options }));
  }, []);

  // Toggle completed tasks visibility
  const toggleCompletedTasks = useCallback(() => {
    setShowCompletedTasks(prev => !prev);
  }, []);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    // Start with all tasks
    let filtered = [...tasks];

    // Apply all filters first, then handle completed tasks visibility separately at the end

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.tags && task.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }

    // Apply status filter
    if (filterOptions.status !== 'all') {
      if (['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'].includes(filterOptions.status)) {
        // Filter by specific status
        filtered = filtered.filter(task => task.status === filterOptions.status);
      } else if (filterOptions.status === 'active') {
        // Filter by active (not completed)
        filtered = filtered.filter(task => !task.completed);
      } else if (filterOptions.status === 'completed') {
        // Filter by completed
        filtered = filtered.filter(task => task.completed);
      }
    }

    // Apply priority filter
    if (filterOptions.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterOptions.priority);
    }

    // Apply category filter
    if (filterOptions.categoryId) {
      filtered = filtered.filter(task => task.categoryId === filterOptions.categoryId);
    }

    // Apply tags filter
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      filtered = filtered.filter(task =>
        task.tags && filterOptions.tags.some(tag => task.tags?.includes(tag))
      );
    }

    // Apply due date filter
    if (filterOptions.dueDate !== 'all') {
      const today = startOfDay(new Date());

      switch (filterOptions.dueDate) {
        case 'overdue':
          filtered = filtered.filter(task =>
            task.dueDate && isBefore(new Date(task.dueDate), today) && !task.completed
          );
          break;
        case 'today':
          filtered = filtered.filter(task =>
            task.dueDate && isToday(new Date(task.dueDate))
          );
          break;
        case 'upcoming':
          filtered = filtered.filter(task =>
            task.dueDate && isAfter(new Date(task.dueDate), today)
          );
          break;
        case 'no-date':
          filtered = filtered.filter(task => !task.dueDate);
          break;
      }
    }

    // Sort tasks
    filtered.sort((a, b) => {
      // First sort by completion status (active tasks first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      let comparison = 0;

      switch (filterOptions.sortBy) {
        case 'created':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'dueDate':
          // Handle tasks without due dates
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = a.dueDate - b.dueDate;
          break;
        case 'priority':
          // Convert priority to numeric value for sorting
          const priorityValues = { high: 3, medium: 2, low: 1, undefined: 0 };
          const aPriority = priorityValues[a.priority || 'undefined'];
          const bPriority = priorityValues[b.priority || 'undefined'];
          comparison = bPriority - aPriority; // Higher priority first
          break;
      }

      // Apply sort direction
      return filterOptions.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchQuery, filterOptions]);

  // Handle task creation success
  const handleTaskCreated = useCallback(() => {
    toast({
      title: "Task created",
      description: "Your task has been created successfully.",
    });
  }, [toast]);

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <CheckSquare className="mr-2 size-5" />
          <span className="truncate">Tasks</span>
        </Button>
      </WorkspaceToolbar>
      <div className="flex h-full flex-col bg-white">
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="mb-4">
            <div className="flex flex-col gap-4">
              <TaskFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
              />

              <div className="flex justify-end">
                {!categoriesLoading && categories && categories.length > 0 && (
                  <Select
                    value={filterOptions.categoryId || 'all'}
                    onValueChange={(value: string) => handleFilterChange({
                      categoryId: value === 'all' ? null : value
                    })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category._id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <CheckSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchQuery || filterOptions.status !== 'all' || filterOptions.priority !== 'all' || filterOptions.dueDate !== 'all' || filterOptions.categoryId !== null
                        ? "Try adjusting your filters or search query"
                        : "Create your first task to get started"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active tasks */}
                    {filteredTasks.filter(task => !task.completed).map((task) => (
                      <TaskItem
                        key={task._id}
                        id={task._id}
                        workspaceId={workspaceId}
                        title={task.title}
                        description={task.description}
                        completed={task.completed}
                        dueDate={task.dueDate}
                        priority={task.priority}
                        categoryId={task.categoryId}
                      />
                    ))}

                    {/* Completed tasks section */}
                    {tasks && tasks.some(task => task.completed) && (
                      <div className="mt-8">
                        <Button
                          variant="ghost"
                          onClick={toggleCompletedTasks}
                          className="mb-2 w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <div className="flex items-center">
                            {showCompletedTasks ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                            <span>Completed tasks</span>
                          </div>
                          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                            {tasks.filter(task => task.completed).length}
                          </span>
                        </Button>

                        {showCompletedTasks && (
                          <div className="space-y-3 mt-2 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                            {filteredTasks.filter(task => task.completed).map((task) => (
                              <TaskItem
                                key={task._id}
                                id={task._id}
                                workspaceId={workspaceId}
                                title={task.title}
                                description={task.description}
                                completed={task.completed}
                                dueDate={task.dueDate}
                                priority={task.priority}
                                categoryId={task.categoryId}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-2 max-w-2xl mx-auto">
                <TaskCreateForm workspaceId={workspaceId} onSuccess={handleTaskCreated} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

