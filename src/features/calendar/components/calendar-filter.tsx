'use client';

import { CheckSquare, Filter, MessageSquare, Trello, CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type EventType = 'message' | 'board-card' | 'task';

export type CalendarFilterOptions = {
  eventTypes: EventType[];
};

interface CalendarFilterProps {
  filterOptions: CalendarFilterOptions;
  onFilterChange: (options: Partial<CalendarFilterOptions>) => void;
}

export const CalendarFilter = ({
  filterOptions,
  onFilterChange,
}: CalendarFilterProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const toggleEventType = (type: EventType) => {
    const currentTypes = [...filterOptions.eventTypes];
    const index = currentTypes.indexOf(type);

    if (index === -1) {
      // Add the type if it's not already selected
      onFilterChange({ eventTypes: [...currentTypes, type] });
    } else {
      // Remove the type if it's already selected
      currentTypes.splice(index, 1);
      onFilterChange({ eventTypes: currentTypes });
    }
  };

  const isEventTypeSelected = (type: EventType) => {
    return filterOptions.eventTypes.includes(type);
  };

  const allTypesSelected = filterOptions.eventTypes.length === 3; // All 3 types selected
  const noTypesSelected = filterOptions.eventTypes.length === 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 border rounded-md transition-all",
              filterOptions.eventTypes.length > 0 && filterOptions.eventTypes.length < 3
                ? "bg-secondary/10 text-secondary border-secondary/20"
                : "bg-white"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {filterOptions.eventTypes.length > 0 && filterOptions.eventTypes.length < 3 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0">
                {filterOptions.eventTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Event Types</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => onFilterChange({
                eventTypes: allTypesSelected || noTypesSelected ? [] : ['message', 'board-card', 'task']
              })}
            >
              {allTypesSelected || noTypesSelected ? 'Clear All' : 'Select All'}
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2 space-y-3">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-secondary" />
                <Label htmlFor="message-events" className="cursor-pointer">Message Events</Label>
              </div>
              <Switch
                id="message-events"
                checked={isEventTypeSelected('message')}
                onCheckedChange={() => toggleEventType('message')}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Trello className="h-4 w-4 text-secondary" />
                <Label htmlFor="board-card-events" className="cursor-pointer">Board Card Events</Label>
              </div>
              <Switch
                id="board-card-events"
                checked={isEventTypeSelected('board-card')}
                onCheckedChange={() => toggleEventType('board-card')}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <Label htmlFor="task-events" className="cursor-pointer">My Tasks</Label>
              </div>
              <Switch
                id="task-events"
                checked={isEventTypeSelected('task')}
                onCheckedChange={() => toggleEventType('task')}
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
