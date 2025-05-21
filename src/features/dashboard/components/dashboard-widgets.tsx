'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Id } from '@/../convex/_generated/dataModel';
import { UnreadMessagesWidget } from './widgets/unread-messages-widget';
import { MentionsWidget } from './widgets/mentions-widget';
import { ThreadRepliesWidget } from './widgets/thread-replies-widget';
import { TasksWidget } from './widgets/tasks-widget';
import { ActivityWidget } from './widgets/activity-widget';
import { CalendarPreviewWidget } from './widgets/calendar-preview-widget';
import { NotesWidget } from './widgets/notes-widget';
import { TeamStatusWidget } from './widgets/team-status-widget';
import { useState, useCallback, useEffect } from 'react';
import {
  RefreshCw,
  GripVertical,
  LayoutGrid,
  LayoutList,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

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
type WidgetType = 'activity' | 'messages' | 'mentions' | 'threads' | 'tasks' | 'calendar' | 'notes' | 'team';

// Layout types
type LayoutType = 'list' | 'grid';

interface WidgetConfig {
  id: WidgetType;
  title: string;
  description: string;
  visible: boolean;
  size?: 'small' | 'medium' | 'large'; // For grid layout
}

// Sortable widget wrapper component
interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  layout: LayoutType;
  size?: 'small' | 'medium' | 'large';
}

const SortableWidget = ({ id, children, layout, size = 'medium' }: SortableWidgetProps) => {
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
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-3',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        layout === 'list' ? "mb-4 relative w-full" : cn(
          "relative",
          gridSizeClasses[size],
          "h-auto"
        ),
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
  const [layout, setLayout] = useState<LayoutType>('list');

  // Default widget order with all available widgets
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    {
      id: 'activity',
      title: 'Recent Activity',
      description: 'Shows recent messages and tasks',
      visible: true,
      size: 'medium'
    },
    {
      id: 'messages',
      title: 'Unread Messages',
      description: 'Shows unread direct messages',
      visible: true,
      size: 'medium'
    },
    {
      id: 'mentions',
      title: 'Mentions',
      description: 'Shows messages where you were mentioned',
      visible: true,
      size: 'small'
    },
    {
      id: 'threads',
      title: 'Thread Replies',
      description: 'Shows replies to your message threads',
      visible: true,
      size: 'small'
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Shows your assigned tasks',
      visible: true,
      size: 'medium'
    },
    {
      id: 'calendar',
      title: 'Upcoming Events',
      description: 'Shows events for the next 7 days',
      visible: true,
      size: 'medium'
    },
    {
      id: 'notes',
      title: 'Recent Notes',
      description: 'Shows recently updated notes',
      visible: true,
      size: 'medium'
    },
    {
      id: 'team',
      title: 'Team Status',
      description: 'Shows team members and their status',
      visible: true,
      size: 'large'
    }
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Save widget preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
      localStorage.setItem('dashboard-layout', layout);
    } catch (error) {
      console.error('Error saving widget preferences:', error);
    }
  }, [widgets, layout]);

  // Load widget preferences from localStorage
  useEffect(() => {
    try {
      const savedWidgets = localStorage.getItem('dashboard-widgets');
      const savedLayout = localStorage.getItem('dashboard-layout');

      if (savedWidgets) {
        setWidgets(JSON.parse(savedWidgets));
      }

      if (savedLayout && (savedLayout === 'list' || savedLayout === 'grid')) {
        setLayout(savedLayout as LayoutType);
      }
    } catch (error) {
      console.error('Error loading widget preferences:', error);
    }
  }, []);

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
  const toggleWidgetVisibility = (id: WidgetType) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === id
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  };

  // Update widget size
  const updateWidgetSize = (id: WidgetType, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === id
          ? { ...widget, size }
          : widget
      )
    );
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
      case 'team':
        return (
          <TeamStatusWidget
            key={`team-${refreshKey}`}
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
            <Tabs
              value={layout}
              onValueChange={(value) => setLayout(value as LayoutType)}
              className="mr-2"
            >
              <TabsList className="h-8">
                <TabsTrigger value="list" className="px-2 h-7">
                  <LayoutList className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="grid" className="px-2 h-7">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
                        {layout === 'grid' && (
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
                              variant={widget.size === 'medium' ? 'default' : 'outline'}
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateWidgetSize(widget.id, 'medium')}
                            >
                              M
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
                        )}
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
        <ScrollArea className="h-[calc(100vh-180px)]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgets.filter(w => w.visible).map(w => w.id)}
              strategy={layout === 'list' ? verticalListSortingStrategy : rectSortingStrategy}
            >
              {layout === 'list' ? (
                // List layout
                <div className="space-y-4">
                  {widgets.filter(w => w.visible).map((widget) => (
                    <SortableWidget
                      key={widget.id}
                      id={widget.id}
                      layout={layout}
                    >
                      {renderWidget(widget.id)}
                    </SortableWidget>
                  ))}
                </div>
              ) : (
                // Grid layout
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {widgets.filter(w => w.visible).map((widget) => (
                    <SortableWidget
                      key={widget.id}
                      id={widget.id}
                      layout={layout}
                      size={widget.size}
                    >
                      {renderWidget(widget.id)}
                    </SortableWidget>
                  ))}
                </div>
              )}
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
