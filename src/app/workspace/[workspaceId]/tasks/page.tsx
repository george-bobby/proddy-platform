'use client';

import { CheckSquare, Loader, PlusCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceToolbar } from '../toolbar';

// Demo task interface
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

const TasksPage = () => {
  const workspaceId = useWorkspaceId();
  const [isLoading, setIsLoading] = useState(false);

  // Demo tasks data
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Create project proposal', completed: false, dueDate: '2025-03-15', assignee: 'John Doe' },
    { id: '2', title: 'Review design mockups', completed: true, dueDate: '2025-03-10', assignee: 'Jane Smith' },
    { id: '3', title: 'Schedule team meeting', completed: false, dueDate: '2025-03-20', assignee: 'Alex Johnson' },
    { id: '4', title: 'Prepare presentation slides', completed: false, dueDate: '2025-03-25', assignee: 'Sarah Williams' },
    { id: '5', title: 'Send client update', completed: false, dueDate: '2025-03-18', assignee: 'Michael Brown' },
  ]);

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Add new task (demo functionality)
  const addNewTask = () => {
    const newTask: Task = {
      id: `${tasks.length + 1}`,
      title: `New task ${tasks.length + 1}`,
      completed: false,
      dueDate: '2025-03-30',
      assignee: 'You'
    };

    setTasks([...tasks, newTask]);
  };

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
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Tasks</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewTask}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="bg-muted p-2 font-medium grid grid-cols-12 gap-4 text-sm">
                <div className="col-span-6">Task</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-3">Assignee</div>
                <div className="col-span-1">Status</div>
              </div>
              <div className="divide-y">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-4 p-3 text-sm items-center hover:bg-muted/20 transition-colors"
                  >
                    <div className="col-span-6 font-medium">
                      <div className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.title}
                      </div>
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {task.dueDate}
                    </div>
                    <div className="col-span-3 text-muted-foreground">
                      {task.assignee}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 ${task.completed ? "bg-green-100 text-green-600" : "bg-gray-100"}`}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        <CheckSquare className={`h-4 w-4 ${task.completed ? "text-green-600" : "text-gray-400"}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
