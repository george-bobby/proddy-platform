'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarFilter, CalendarFilterOptions } from './calendar-filter';

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

  return (
    <div className="border-b bg-white px-6 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousMonth}
              className="h-8 w-8 p-0 rounded-md border-gray-300 hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center font-medium bg-white px-3 py-1.5 rounded-md border border-gray-300 shadow-sm">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextMonth}
              className="h-8 w-8 p-0 rounded-md border-gray-300 hover:bg-gray-100 hover:text-gray-700"
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-white w-full border-gray-300 focus-visible:ring-gray-400 focus-visible:ring-opacity-30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}
      </div>

      {/* Event counts display */}
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
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
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                <span>{eventCounts.message}</span>
                <span>Messages</span>
              </div>
            )}

            {filterOptions.eventTypes.includes('board-card') && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                <span>{eventCounts.boardCard}</span>
                <span>Board Cards</span>
              </div>
            )}

            {filterOptions.eventTypes.includes('task') && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                <span>{eventCounts.task}</span>
                <span>Tasks</span>
              </div>
            )}
          </div>
        )}

        {filterOptions.eventTypes.length > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            (Total: {eventCounts.total})
          </span>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
