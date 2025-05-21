'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Plus, ArrowRight, Loader } from 'lucide-react';
import { Id } from '@/../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useGetCalendarEvents } from '@/features/calendar/api/use-get-calendar-events';
import { format, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';

interface CalendarPreviewWidgetProps {
  workspaceId: Id<'workspaces'>;
  member: any;
}

export const CalendarPreviewWidget = ({ workspaceId, member }: CalendarPreviewWidgetProps) => {
  const router = useRouter();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get calendar events
  const { data: events, isLoading } = useGetCalendarEvents({
    workspaceId,
    month: currentMonth,
    year: currentYear,
  });

  // Create array of next seven days
  const nextSevenDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, [today]);

  // Get upcoming events for the next 7 days
  const upcomingEvents = useMemo(() => {
    if (!events) return [];

    const startOfToday = startOfDay(today).getTime();
    const endOfNextWeek = endOfDay(addDays(today, 6)).getTime();

    return events
      .filter(event => {
        // Use the date property instead of startTime
        const eventDate = event.date;
        return eventDate >= startOfToday && eventDate <= endOfNextWeek;
      })
      .sort((a, b) => a.date - b.date);
  }, [events, today]);

  const handleViewEvent = (eventId: Id<'events'>) => {
    router.push(`/workspace/${workspaceId}/calendar?eventId=${eventId}`);
  };

  const handleCreateEvent = () => {
    router.push(`/workspace/${workspaceId}/calendar?action=create`);
  };

  const handleViewCalendar = () => {
    router.push(`/workspace/${workspaceId}/calendar`);
  };

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped = new Map();

    nextSevenDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayEvents = upcomingEvents.filter(event =>
        isSameDay(new Date(event.date), day)
      );

      grouped.set(dateKey, {
        date: day,
        events: dayEvents
      });
    });

    return Array.from(grouped.values());
  }, [upcomingEvents, nextSevenDays]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pr-8">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Upcoming Events</h3>
          {upcomingEvents.length > 0 && (
            <Badge variant="default" className="ml-2">
              {upcomingEvents.length}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateEvent}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Event
        </Button>
      </div>

      {upcomingEvents.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border">
          <div className="space-y-4 p-4">
            {eventsByDay.map((dayData) => (
              <div key={format(dayData.date, 'yyyy-MM-dd')} className="space-y-2">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-1">
                  <h4 className="text-sm font-medium">
                    {isSameDay(dayData.date, today)
                      ? 'Today'
                      : isSameDay(dayData.date, addDays(today, 1))
                        ? 'Tomorrow'
                        : format(dayData.date, 'EEEE, MMMM d')}
                  </h4>
                </div>

                {dayData.events.length > 0 ? (
                  dayData.events.map((event) => (
                    <Card key={event._id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{event.title}</h5>
                            <Badge variant={!event.time ? "outline" : "secondary"} className="text-xs">
                              {!event.time
                                ? 'All day'
                                : event.time}
                            </Badge>
                          </div>
                          {/* Location is not available in the current event structure */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 w-full justify-start text-primary"
                            onClick={() => handleViewEvent(event._id)}
                          >
                            View details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No events scheduled</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[250px] flex-col items-center justify-center rounded-md border bg-muted/10">
          <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">No upcoming events</h3>
          <p className="text-sm text-muted-foreground">
            Schedule events to see them here
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleViewCalendar}
          >
            View Calendar <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
