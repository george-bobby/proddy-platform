'use client';

import { isAfter, isBefore, isToday, startOfDay } from 'date-fns';
import { CheckSquare, ChevronDown, ChevronRight, Loader, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceToolbar } from '../toolbar';

import { useGetTaskCategories } from '@/features/tasks/api/use-get-task-categories';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { TaskCreateForm } from '@/features/tasks/components/task-create-form';
import { TaskFilterOptions } from '@/features/tasks/components/task-filter';
import { TaskItem } from '@/features/tasks/components/task-item';
import { TaskSidebar } from '@/features/tasks/components/task-sidebar';

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
      <div className="flex h-[calc(100%-4rem)] bg-white">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Header with search */}
            <div className="mb-8 space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <div className="relative">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6 pb-8">
                <div className="pt-4 mt-8 border-t border-gray-100">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Create a new task</h2>
                  <TaskCreateForm workspaceId={workspaceId} onSuccess={handleTaskCreated} />
                </div>
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <div className="rounded-full bg-gray-100 p-4">
                        <CheckSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold">No tasks found</h3>
                      <p className="mt-2 text-gray-500 max-w-md mx-auto">
                        {searchQuery || filterOptions.status !== 'all' || filterOptions.priority !== 'all' || filterOptions.dueDate !== 'all' || filterOptions.categoryId !== null
                          ? "Try adjusting your filters or search query"
                          : "Create your first task to get started"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Active tasks - Hide the section title when filter is set to "completed" */}
                      <div className="space-y-3">
                        {filterOptions.status !== 'completed' && (
                          <div className="flex items-center">
                            <h2 className="text-lg font-medium text-gray-800">Active tasks</h2>
                            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {filteredTasks.filter(task => !task.completed).length}
                            </span>
                          </div>
                        )}

                        <div className="grid gap-4">
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
                        </div>
                      </div>

                      {/* Completed tasks section */}
                      {tasks && tasks.some(task => task.completed) && filterOptions.status !== 'active' && (
                        <div className="mt-10 pt-4 border-t border-gray-100">
                          {filterOptions.status === 'completed' ? (
                            // When filter is set to "completed", show tasks directly
                            <>
                              <div className="flex items-center mb-3">
                                <h2 className="text-lg font-medium text-gray-800">Completed tasks</h2>
                                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                  {filteredTasks.filter(task => task.completed).length}
                                </span>
                              </div>
                              <div className="space-y-3">
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
                            </>
                          ) : (
                            // For other filter statuses, show with dropdown
                            <>
                              <Button
                                variant="ghost"
                                onClick={toggleCompletedTasks}
                                className="w-full flex items-center justify-between py-2 text-sm hover:bg-gray-50 rounded-md"
                              >
                                <div className="flex items-center text-gray-600 font-medium">
                                  {showCompletedTasks ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                                  <span>Completed tasks</span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                  {tasks.filter(task => task.completed).length}
                                </span>
                              </Button>

                              {showCompletedTasks && (
                                <div className="space-y-3 mt-3 animate-in fade-in-50 slide-in-from-top-5 duration-300">
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
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar with filters */}
        <TaskSidebar
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />
      </div>
    </div>
  );
};

export default TasksPage;

