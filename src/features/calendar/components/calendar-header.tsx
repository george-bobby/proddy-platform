'use client';

import { ChevronLeft, ChevronRight, CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarFilter, CalendarFilterOptions, EventType } from './calendar-filter';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  filterOptions: CalendarFilterOptions;
  onFilterChange: (options: Partial<CalendarFilterOptions>) => void;
  eventCounts: {
    total: number;
    message: number;
    boardCard: number;
    task: number;
  };
  onSearch?: (query: string) => void;
}

export const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  filterOptions,
  onFilterChange,
  eventCounts,
  onSearch,
}: CalendarHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case 'message':
        return 'Message Events';
      case 'board-card':
        return 'Board Cards';
      case 'task':
        return 'My Tasks';
      default:
        return '';
    }
  };

  return (
    <div className="border-b bg-white px-6 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousMonth}
              className="h-8 w-8 p-0 rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center font-medium bg-white/90 px-3 py-1.5 rounded-md border shadow-sm">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextMonth}
              className="h-8 w-8 p-0 rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <CalendarFilter
            filterOptions={filterOptions}
            onFilterChange={onFilterChange}
          />
        </div>

        {onSearch && (
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-white/80 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}
      </div>

      {/* Event counts display */}
      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        <span>
          {filterOptions.eventTypes.length === 0
            ? 'No filters applied'
            : filterOptions.eventTypes.length === 3
              ? 'Showing all events'
              : 'Showing:'}
        </span>

        {filterOptions.eventTypes.length > 0 && (
          <div className="flex items-center gap-2">
            {filterOptions.eventTypes.includes('message') && (
              <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs">
                <span>{eventCounts.message}</span>
                <span>Messages</span>
              </div>
            )}

            {filterOptions.eventTypes.includes('board-card') && (
              <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs">
                <span>{eventCounts.boardCard}</span>
                <span>Board Cards</span>
              </div>
            )}

            {filterOptions.eventTypes.includes('task') && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                <span>{eventCounts.task}</span>
                <span>Tasks</span>
              </div>
            )}
          </div>
        )}

        {filterOptions.eventTypes.length > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            (Total: {eventCounts.total})
          </span>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
