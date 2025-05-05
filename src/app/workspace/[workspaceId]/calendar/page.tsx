'use client';

import { addMonths, format, getMonth, getYear, subMonths } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Loader, MessageSquare, Trello } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import Renderer from '@/components/renderer';
import { Button } from '@/components/ui/button';
import { useGetCalendarEvents } from '@/features/calendar/api/use-get-calendar-events';
import { CalendarFilter, CalendarFilterOptions } from '@/features/calendar/components/calendar-filter';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceToolbar } from '../toolbar';
import { Id } from '@/../convex/_generated/dataModel';

// Define types for calendar events
interface CalendarEventUser {
  _id: Id<'users'>;
  name: string;
  image: string | null;
}

interface CalendarEventMessage {
  _id: Id<'messages'>;
  body: string;
  _creationTime: number;
  channelId?: Id<'channels'>;
  conversationId?: Id<'conversations'>;
  calendarEvent?: {
    date: number;
    time?: string;
  };
}

interface BoardCard {
  _id: Id<'cards'>;
  title: string;
  description?: string;
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  labels?: string[];
  listId: Id<'lists'>;
  listTitle: string;
  channelId: Id<'channels'>;
  channelName: string;
}

interface CalendarEvent {
  _id: Id<'events'>;
  _creationTime: number;
  date: number;
  title?: string;
  time?: string;
  type: string; // Using string instead of union type to accommodate all possible values
  boardCard?: BoardCard;
  message?: CalendarEventMessage | null; // Allow null values
  user?: CalendarEventUser | null; // Allow null values
  memberId: Id<'members'>;
  workspaceId: Id<'workspaces'>;
  messageId?: Id<'messages'>;
}

// Define type for calendar day objects
interface CalendarDay {
  day: number | null;
  isCurrentMonth: boolean;
  events?: CalendarEvent[];
}

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const workspaceId = useWorkspaceId();
  const { data: events, isLoading } = useGetCalendarEvents({
    workspaceId,
    month: getMonth(currentDate),
    year: getYear(currentDate),
  });

  // Filter state
  const [filterOptions, setFilterOptions] = useState<CalendarFilterOptions>({
    eventType: 'all',
  });

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleFilterChange = (newOptions: Partial<CalendarFilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newOptions }));
  };

  // Filter events based on filter options
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter(event => {
      // Filter by event type
      if (filterOptions.eventType !== 'all') {
        if (filterOptions.eventType === 'message') {
          return event.type === 'calendar-event';
        }
        return event.type === filterOptions.eventType;
      }

      return true;
    });
  }, [events, filterOptions]);

  // Count events by type for stats
  const eventCounts = useMemo(() => {
    if (!events) return { total: 0, message: 0, boardCard: 0 };

    return {
      total: events.length,
      message: events.filter(event => event.type === 'calendar-event').length,
      boardCard: events.filter(event => event.type === 'board-card').length
    };
  }, [events]);

  // Group events by day
  const eventsByDay = filteredEvents.reduce<Record<number, CalendarEvent[]>>((acc, event) => {
    const day = new Date(event.date).getDate();
    if (!acc[day]) {
      acc[day] = [];
    }
    // Type assertion to ensure event matches CalendarEvent interface
    acc[day].push(event as CalendarEvent);
    return acc;
  }, {});

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[][] => {
    if (!currentDate) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create an array of day objects
    const days: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        events: eventsByDay?.[day] || []
      });
    }

    // Add empty cells to complete the last week if needed
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push({ day: null, isCurrentMonth: false });
      }
    }

    // Group days into weeks
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const weeks = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <CalendarIcon className="mr-2 size-5" />
          <span className="truncate">Calendar</span>
        </Button>
      </WorkspaceToolbar>
      <div className="flex h-full flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <div className="flex items-center gap-2">
            <CalendarFilter
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
            />
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {filterOptions.eventType === 'all' ? (
                <>
                  <span>Showing all events ({eventCounts.total}):</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-primary" />
                    <span>{eventCounts.message}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trello className="h-3 w-3 text-secondary" />
                    <span>{eventCounts.boardCard}</span>
                  </div>
                </>
              ) : (
                <>
                  <span>Showing</span>
                  {filterOptions.eventType === 'message' ? (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-primary" />
                      <span>{eventCounts.message} message events</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Trello className="h-3 w-3 text-secondary" />
                      <span>{eventCounts.boardCard} board card events</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[120px] text-center font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-full rounded-md border">
              {/* Calendar header */}
              <div className="grid grid-cols-7 gap-px border-b bg-muted text-center">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="bg-background p-2 text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid h-[calc(100%-1rem)] grid-cols-7 grid-rows-6 gap-px bg-muted">
                {weeks.flat().map((dayObj, index) => (
                  <div
                    key={index}
                    className={`relative bg-background p-1 ${dayObj.isCurrentMonth ? '' : 'text-muted-foreground opacity-50'
                      } ${dayObj.day &&
                        new Date().getDate() === dayObj.day &&
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear()
                        ? 'bg-accent'
                        : ''
                      }`}
                  >
                    {dayObj.day && (
                      <>
                        <div className="absolute right-1 top-1 text-xs">
                          {dayObj.day}
                        </div>
                        {dayObj.events && dayObj.events.length > 0 && (
                          <div className="mt-4 flex max-h-[80px] flex-col gap-1 overflow-y-auto">
                            {dayObj.events.map((event) => (
                              <Link
                                href={
                                  event.type === 'board-card' && event.boardCard
                                    ? `/workspace/${workspaceId}/channel/${event.boardCard.channelId}/board`
                                    : event.message?.channelId
                                      ? `/workspace/${workspaceId}/channel/${event.message.channelId}`
                                      : event.message?.conversationId
                                        ? `/workspace/${workspaceId}/member/${event.memberId}`
                                        : '#'
                                }
                                key={event._id}
                                className={`block rounded-sm p-1 text-[10px] leading-tight transition-colors ${event.type === 'board-card'
                                  ? 'bg-secondary/10 hover:bg-secondary/20 border-l-2 border-secondary'
                                  : 'bg-primary/10 hover:bg-primary/20 border-l-2 border-primary'
                                  }`}
                                title={
                                  event.type === 'board-card' && event.boardCard
                                    ? `${event.boardCard.title} (${event.boardCard.listTitle})`
                                    : event?.message?.body
                                      ? JSON.parse(event.message.body).ops[0].insert
                                      : ''
                                }
                              >
                                {event.time && (
                                  <span className="font-bold">{event.time}</span>
                                )}
                                <div className="truncate">
                                  {event.type === 'board-card' && event.boardCard ? (
                                    <>
                                      <div className="font-medium">{event.boardCard.title}</div>
                                      {event.type === 'board-card' && 'boardCard' in event && event.boardCard && event.boardCard.description && (
                                        <div className="text-[8px] text-muted-foreground truncate">
                                          {event.boardCard.description}
                                        </div>
                                      )}
                                    </>
                                  ) : event?.message?.body ? (
                                    <Renderer
                                      value={event.message.body}
                                      calendarEvent={event.message.calendarEvent}
                                    />
                                  ) : (
                                    'Event'
                                  )}
                                </div>
                                <div className="text-[8px] text-muted-foreground flex items-center justify-between">
                                  <span>
                                    {event.type === 'board-card' ? (
                                      <>Board Card in {event.boardCard?.listTitle}</>
                                    ) : (
                                      <>Calendar Event by {event?.user?.name || 'Unknown'}</>
                                    )}
                                  </span>
                                  {event.type === 'board-card' && event.boardCard?.priority && (
                                    <span className={`text-[8px] px-1 rounded ${event.boardCard.priority === 'high'
                                      ? 'bg-destructive/20 text-destructive'
                                      : event.boardCard.priority === 'medium'
                                        ? 'bg-secondary/20 text-secondary'
                                        : 'bg-primary/20 text-primary'
                                      }`}>
                                      {event.boardCard.priority}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
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

export default CalendarPage;
