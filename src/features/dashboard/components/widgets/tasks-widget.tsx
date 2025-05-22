'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Loader, KanbanSquare } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useGetTaskCategories } from '@/features/tasks/api/use-get-task-categories';
import { useUpdateTask } from '@/features/tasks/api/use-update-task';
import { formatDistanceToNow } from 'date-fns';
import { useGetAssignedCards } from '@/features/board/api/use-get-assigned-cards';
import { useGetChannels } from '@/features/channels/api/use-get-channels';

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
  const { data: tasks, isLoading: tasksLoading } = useGetTasks({ workspaceId });
  const { data: categories } = useGetTaskCategories({ workspaceId });
  const updateTask = useUpdateTask();

  // Fetch channels for the workspace
  const { data: channels } = useGetChannels({ workspaceId });

  // Fetch board items assigned to the current user
  const { data: assignedCards, isLoading: cardsLoading } = useGetAssignedCards({ workspaceId });

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
    .slice(0, 5) : []; // Limit to 5 tasks for the widget

  // Sort board cards by due date and creation time
  const sortedCards = assignedCards ? [...assignedCards]
    .sort((a, b) => {
      // Sort by due date if available
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate;
      }

      // If only one has a due date, prioritize it
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Finally sort by creation time
      return b._creationTime - a._creationTime;
    })
    .slice(0, 5) : []; // Limit to 5 cards for the widget

  // Define a type for our combined items
  type CombinedItem = {
    _id: Id<'tasks'> | Id<'cards'>;
    _creationTime: number;
    title: string;
    itemType: 'task' | 'card';
    completed: boolean;
    dueDate?: number;
    priority?: string;
    categoryId?: Id<'categories'>;
    channelId?: Id<'channels'>;
    channelName?: string;
    listId?: Id<'lists'>;
    listTitle?: string;
    [key: string]: any;
  };

  // Combine both types of items
  const combinedItems: CombinedItem[] = [
    ...sortedTasks.map(task => ({
      ...task,
      itemType: 'task' as const,
      // Ensure task has all required properties
      completed: task.completed || false,
      categoryId: task.categoryId,
      priority: task.priority
    })),
    ...sortedCards.map(card => ({
      ...card,
      itemType: 'card' as const,
      // Add properties needed for consistent rendering
      completed: false, // Cards don't have completion status
      categoryId: undefined,
      channelName: card.channelName || 'Unknown Channel'
    }))
  ].sort((a, b) => {
    // Sort by due date if available
    if (a.dueDate && b.dueDate) {
      return a.dueDate - b.dueDate;
    }

    // If only one has a due date, prioritize it
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // Finally sort by creation time
    return b._creationTime - a._creationTime;
  }).slice(0, 10); // Limit to 10 total items

  const isLoading = tasksLoading || cardsLoading;

  // Handle viewing a task or board card
  const handleViewItem = (item: any) => {
    if (item.itemType === 'card' || item.listId) {
      // Navigate to the board card
      const channelId = item.channelId;
      router.push(`/workspace/${workspaceId}/channel/${channelId}/board?cardId=${item._id}`);
    } else {
      // Navigate to the task
      router.push(`/workspace/${workspaceId}/tasks?taskId=${item._id}`);
    }
  };

  const handleToggleTaskCompletion = (id: Id<'tasks'> | Id<'cards'>, completed: boolean) => {
    // Only toggle completion for tasks, not cards
    if (typeof id === 'string' && id.startsWith('tasks:')) {
      updateTask({
        id: id as Id<'tasks'>,
        completed: !completed
      });
    }
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
          <h3 className="font-medium">Your Work Items</h3>
          {combinedItems.length > 0 && (
            <Badge variant="default" className="ml-2">
              {combinedItems.length}
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

      {combinedItems.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-2 p-4">
            {combinedItems.map((item) => (
              <Card
                key={item._id}
                className={`overflow-hidden ${item.itemType === 'task' && item.completed ? 'bg-muted/20' : ''}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {item.itemType === 'task' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleToggleTaskCompletion(item._id, item.completed)}
                        disabled={item.itemType !== 'task'}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </Button>
                    ) : (
                      <KanbanSquare className="h-5 w-5 text-primary mt-1" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${item.itemType === 'task' && item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {item.itemType === 'task' && getPriorityBadge(item.priority)}
                          {item.dueDate && (
                            <div className={`flex items-center text-xs ${new Date(item.dueDate) < new Date() && (item.itemType === 'task' && !item.completed)
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                              }`}>
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}
                              {new Date(item.dueDate) < new Date() && (item.itemType === 'task' && !item.completed) && (
                                <AlertCircle className="ml-1 h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {item.itemType === 'card'
                            ? ('channelName' in item ? item.channelName : 'Unknown Channel')
                            : getCategoryName(item.categoryId)
                          }
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                          onClick={() => handleViewItem(item)}
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
          <h3 className="text-lg font-medium">No work items</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any tasks or board items assigned
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspace/${workspaceId}/tasks`)}
            >
              Create a task
            </Button>
            {channels && channels.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/workspace/${workspaceId}/channel/${channels[0]._id}/board`)}
              >
                View boards
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
