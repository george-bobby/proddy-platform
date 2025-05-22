'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Id } from '@/../convex/_generated/dataModel';
import { MentionsWidget } from './widgets/mentions-widget';
import { ThreadRepliesWidget } from './widgets/thread-replies-widget';
import { TasksWidget } from './widgets/tasks-widget';
import { AssignedCardsWidget } from './widgets/assigned-cards-widget';
import { CalendarPreviewWidget } from './widgets/calendar-preview-widget';
import { NotesWidget } from './widgets/notes-widget';
import { CanvasWidget } from './widgets/canvas-widget';
import { useState, useCallback, useEffect } from 'react';
import {
  RefreshCw,
  GripVertical,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { useDashboardWidgets } from '@/features/workspaces/api/use-workspace-preferences';
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
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { DashboardWidget, WidgetSize } from '@/../convex/userPreferences';

interface DashboardWidgetsProps {
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

// Widget types
type WidgetType = 'mentions' | 'threads' | 'tasks' | 'cards' | 'calendar' | 'notes' | 'canvas';

// Sortable widget wrapper component
interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  size: 'small' | 'large';
}

const SortableWidget = ({ id, children, size }: SortableWidgetProps) => {
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

  // Grid layout classes based on size
  const gridSizeClasses = {
    small: 'col-span-1', // Half width (1 column)
    large: 'col-span-1 md:col-span-2', // Full width (2 columns)
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        gridSizeClasses[size],
        "h-auto mb-4",
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use the Convex-backed dashboard widgets state
  const [widgets, setWidgets] = useDashboardWidgets({ workspaceId });

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

  // Toggle widget visibility
  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map(widget =>
        widget.id === id
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  };

  // Update widget size
  const updateWidgetSize = (id: string, size: WidgetSize) => {
    setWidgets((prev) =>
      prev.map(widget =>
        widget.id === id
          ? { ...widget, size }
          : widget
      )
    );
  };

  // Render the appropriate widget based on type
  const renderWidget = useCallback((type: string) => {
    // Cast to WidgetType for switch statement
    const widgetType = type as WidgetType;
    switch (widgetType) {
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
      case 'cards':
        return (
          <AssignedCardsWidget
            key={`cards-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      case 'calendar':
        return (
          <CalendarPreviewWidget
            key={`calendar-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );
      case 'notes':
        return (
          <NotesWidget
            key={`notes-${refreshKey}`}
            workspaceId={workspaceId}
            member={member}
          />
        );

      case 'canvas':
        return (
          <CanvasWidget
            key={`canvas-${refreshKey}`}
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 mr-8" // Added margin-right to avoid overlap with drag handle
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Dashboard Settings</SheetTitle>
                  <SheetDescription>
                    Customize your dashboard by showing or hiding widgets and changing their size.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="mb-4 text-sm font-medium">Visible Widgets</h3>
                  <div className="space-y-4">
                    {widgets.map((widget) => (
                      <div key={widget.id} className="flex items-start justify-between space-x-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center">
                            <Switch
                              id={`widget-${widget.id}`}
                              checked={widget.visible}
                              onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                              className="mr-2"
                            />
                            <Label htmlFor={`widget-${widget.id}`} className="font-medium">
                              {widget.title}
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground">{widget.description}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant={widget.size === 'small' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateWidgetSize(widget.id, 'small')}
                          >
                            S
                          </Button>
                          <Button
                            variant={widget.size === 'large' ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => updateWidgetSize(widget.id, 'large')}
                          >
                            L
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-180px)] pb-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgets.filter(w => w.visible).map(w => w.id)}
              strategy={rectSortingStrategy}
            >
              {/* Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {widgets.filter(w => w.visible).map((widget) => (
                  <SortableWidget
                    key={widget.id}
                    id={widget.id}
                    size={widget.size}
                  >
                    {renderWidget(widget.id)}
                  </SortableWidget>
                ))}
              </div>
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
