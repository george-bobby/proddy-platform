'use client';

import { Filter, MessageSquare, Trello } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export type CalendarFilterOptions = {
  eventType: 'all' | 'message' | 'board-card';
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterOptions.eventType !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1.5">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Event Type
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={filterOptions.eventType}
              onValueChange={(value) => onFilterChange({ eventType: value as any })}
            >
              <DropdownMenuRadioItem value="all" className="cursor-pointer">
                <span className="flex items-center">
                  All Events
                </span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="message" className="cursor-pointer">
                <span className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                  Message Events
                </span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="board-card" className="cursor-pointer">
                <span className="flex items-center">
                  <Trello className="mr-2 h-4 w-4 text-secondary" />
                  Board Card Events
                </span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => onFilterChange({
              eventType: 'all',
            })}
          >
            Reset Filters
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
