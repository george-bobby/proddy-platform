'use client';

import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface FilterOptions {
  meeting: boolean;
  deadline: boolean;
  task: boolean;
  incident: boolean;
  social: boolean;
}

export interface EventCounts {
  total: number;
  meeting: number;
  deadline: number;
  task: number;
  incident: number;
  social: number;
}

interface TestCalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  eventCounts: EventCounts;
}

export const TestCalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  filterOptions,
  onFilterChange,
  eventCounts,
}: TestCalendarHeaderProps) => {
  return (
    <div className="border-b bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        {/* Left side - Month display */}
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>

        {/* Right side - Month controls and filters */}
        <div className="flex items-center gap-3">

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Event Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter Events
                {Object.values(filterOptions).filter(v => !v).length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {Object.values(filterOptions).filter(v => v).length}/5
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Event Type</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={filterOptions.meeting}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, meeting: checked })
                }
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-blue-500" />
                  <span>Meetings ({eventCounts.meeting})</span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={filterOptions.deadline}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, deadline: checked })
                }
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-red-500" />
                  <span>Deadlines ({eventCounts.deadline})</span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={filterOptions.task}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, task: checked })
                }
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-green-500" />
                  <span>Tasks ({eventCounts.task})</span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={filterOptions.incident}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, incident: checked })
                }
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-orange-500" />
                  <span>Incidents ({eventCounts.incident})</span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={filterOptions.social}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, social: checked })
                }
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-purple-500" />
                  <span>Social ({eventCounts.social})</span>
                </div>
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <div className="flex gap-2 p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onFilterChange({
                      meeting: true,
                      deadline: true,
                      task: true,
                      incident: true,
                      social: true,
                    });
                  }}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onFilterChange({
                      meeting: false,
                      deadline: false,
                      task: false,
                      incident: false,
                      social: false,
                    });
                  }}
                >
                  Clear All
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Options */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button variant="ghost" size="sm" className="bg-muted text-foreground">
              Month
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Week
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Day
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
