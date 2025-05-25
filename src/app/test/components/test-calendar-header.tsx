'use client';

import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { TestNavigation } from '@/app/test/components/test-navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/test/dashboard');
  };

  return (
    <div className="border-b bg-background p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left side - Calendar navigation and title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Calendar</h1>
            <Badge variant="secondary" className="text-xs">
              Demo
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{eventCounts.total} events this month</span>
            </div>
          </div>
        </div>

        {/* Right side - Navigation, month controls and filters */}
        <div className="flex items-center gap-4">
          <TestNavigation variant="compact" />

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center">
              <span className="text-lg font-medium">
                {format(currentDate, 'MMMM yyyy')}
              </span>
            </div>
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
            <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">
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

      {/* Event Type Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-muted-foreground">Legend:</span>
        {Object.entries(eventCounts).map(([type, count]) => {
          if (type === 'total' || count === 0) return null;

          return (
            <div key={type} className="flex items-center gap-1">
              <div className={cn("h-3 w-3 rounded-sm", {
                'bg-blue-500': type === 'meeting',
                'bg-red-500': type === 'deadline',
                'bg-green-500': type === 'task',
                'bg-orange-500': type === 'incident',
                'bg-purple-500': type === 'social',
              })} />
              <span className="capitalize">{type} ({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
