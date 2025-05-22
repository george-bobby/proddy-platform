'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useGetTaskCategories } from '@/features/tasks/api/use-get-task-categories';
import { useUpdateTask } from '@/features/tasks/api/use-update-task';
import { formatDistanceToNow } from 'date-fns';

interface TasksWidgetProps {
  workspaceId: Id<'workspaces'>;
  member: {
    _id: Id<'members'>;
    userId: Id<'users'>;
    role: string;
    workspaceId: Id<'workspaces'>;
    user?: {
      name: string;
      image?: string;
    };
  };
}



export const TasksWidget = ({ workspaceId }: TasksWidgetProps) => {
  const router = useRouter();

  // Fetch workspace tasks
  const { data: tasks, isLoading } = useGetTasks({ workspaceId });
  const { data: categories } = useGetTaskCategories({ workspaceId });
  const updateTask = useUpdateTask();

  // Filter tasks to show only incomplete ones first, then by due date
  const sortedTasks = tasks ? [...tasks]
    .sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Then sort by due date if available
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate;
      }

      // If only one has a due date, prioritize it
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Finally sort by creation time
      return b._creationTime - a._creationTime;
    })
    .slice(0, 10) : []; // Limit to 10 tasks for the widget

  // Handle viewing a task
  const handleViewTask = (taskId: Id<'tasks'>) => {
    router.push(`/workspace/${workspaceId}/tasks?taskId=${taskId}`);
  };

  const handleToggleTaskCompletion = (id: Id<'tasks'>, completed: boolean) => {
    updateTask({
      id,
      completed: !completed
    });
  };

  // Get category name by ID
  const getCategoryName = (categoryId: Id<'categories'> | undefined) => {
    if (!categoryId || !categories) return 'Uncategorized';
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Get priority badge
  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority) return null;

    const priorityColors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pr-8"> {/* Added padding-right to avoid overlap with drag handle */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Workspace Tasks</h3>
          {sortedTasks.length > 0 && (
            <Badge variant="default" className="ml-2">
              {sortedTasks.length}
            </Badge>
          )}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspace/${workspaceId}/tasks`)}
            >
              View all
            </Button>
          </div>
        </div>
      </div>

      {sortedTasks.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {sortedTasks.map((task) => (
              <Card
                key={task._id}
                className={`overflow-hidden ${task.completed ? 'bg-muted/20' : ''}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={() => handleToggleTaskCompletion(task._id, task.completed)}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </Button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          {task.dueDate && (
                            <div className={`flex items-center text-xs ${new Date(task.dueDate) < new Date() && !task.completed
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                              }`}>
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                              {new Date(task.dueDate) < new Date() && !task.completed && (
                                <AlertCircle className="ml-1 h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(task.categoryId)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                          onClick={() => handleViewTask(task._id)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[250px] flex-col items-center justify-center rounded-md border bg-muted/10">
          <CheckSquare className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No tasks</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any workspace tasks assigned
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspace/${workspaceId}/tasks`)}
            >
              Create a task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
