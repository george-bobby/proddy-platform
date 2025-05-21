'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Id } from '@/../convex/_generated/dataModel';
import { UnreadMessagesWidget } from './widgets/unread-messages-widget';
import { MentionsWidget } from './widgets/mentions-widget';
import { ThreadRepliesWidget } from './widgets/thread-replies-widget';
import { TasksWidget } from './widgets/tasks-widget';
import { ActivityWidget } from './widgets/activity-widget';
import { useState, useCallback } from 'react';
import { RefreshCw, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface DashboardWidgetsProps {
  workspaceId: Id<'workspaces'>;
  member: any;
}

// Widget types
type WidgetType = 'activity' | 'messages' | 'mentions' | 'threads' | 'tasks';

interface WidgetConfig {
  id: WidgetType;
  title: string;
}

// Sortable widget wrapper component
interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
}

const SortableWidget = ({ id, children }: SortableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-4 relative",
        isDragging ? "z-10" : ""
      )}
    >
      <div
        className="absolute top-3 right-3 cursor-grab touch-none p-1 rounded-md hover:bg-muted/50 transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
};

export const DashboardWidgets = ({ workspaceId, member }: DashboardWidgetsProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  // Default widget order
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: 'activity', title: 'Recent Activity' },
    { id: 'messages', title: 'Unread Messages' },
    { id: 'mentions', title: 'Mentions' },
    { id: 'threads', title: 'Thread Replies' },
    { id: 'tasks', title: 'Tasks' }
  ]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  // Render the appropriate widget based on type
  const renderWidget = useCallback((type: WidgetType) => {
    switch (type) {
      case 'activity':
        return (
          <ActivityWidget
            key={`activity-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      case 'messages':
        return (
          <UnreadMessagesWidget
            key={`messages-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      case 'mentions':
        return (
          <MentionsWidget
            key={`mentions-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      case 'threads':
        return (
          <ThreadRepliesWidget
            key={`threads-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      case 'tasks':
        return (
          <TasksWidget
            key={`tasks-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      default:
        return null;
    }
  }, [workspaceId, member, refreshKey]);

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Workspace Overview</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0 mr-8" // Added margin-right to avoid overlap with drag handle
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {widgets.map((widget) => (
                <SortableWidget key={widget.id} id={widget.id}>
                  {renderWidget(widget.id)}
                </SortableWidget>
              ))}
            </SortableContext>

            {/* Drag overlay for visual feedback */}
            <DragOverlay>
              {activeId ? (
                <div className="opacity-80 w-full">
                  {renderWidget(activeId as WidgetType)}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
