'use client';

import { CheckCircle2, Circle, Clock, Filter, SortAsc, SortDesc, Tag, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Id } from '@/../convex/_generated/dataModel';

import { TaskFilterOptions } from './task-filter';

interface TaskSidebarProps {
  filterOptions: TaskFilterOptions;
  onFilterChange: (options: Partial<TaskFilterOptions>) => void;
  categories: Array<{
    _id: Id<'categories'>;
    name: string;
    color: string;
  }> | undefined;
  categoriesLoading: boolean;
}

export const TaskSidebar = ({
  filterOptions,
  onFilterChange,
  categories,
  categoriesLoading,
}: TaskSidebarProps) => {
  // Helper to check if a filter is active
  const isFilterActive = () => {
    return (
      filterOptions.status !== 'all' ||
      filterOptions.priority !== 'all' ||
      filterOptions.dueDate !== 'all' ||
      filterOptions.categoryId !== null
    );
  };

  // Reset all filters
  const resetAllFilters = () => {
    onFilterChange({
      status: 'all',
      priority: 'all',
      dueDate: 'all',
      categoryId: null,
    });
  };

  return (
    <div className="w-[280px] h-full border-l border-border/30 p-4 overflow-y-auto flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Filters</h3>
        {isFilterActive() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset all
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Status</h4>
        <div className="space-y-1">
          <Button
            variant={filterOptions.status === 'all' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ status: 'all' })}
          >
            All
          </Button>
          <Button
            variant={filterOptions.status === 'active' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ status: 'active' })}
          >
            <Circle className="mr-2 h-4 w-4" />
            Active
          </Button>
          <Button
            variant={filterOptions.status === 'completed' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ status: 'completed' })}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Completed
          </Button>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Priority</h4>
        <div className="space-y-1">
          <Button
            variant={filterOptions.priority === 'all' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ priority: 'all' })}
          >
            All
          </Button>
          <Button
            variant={filterOptions.priority === 'high' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ priority: 'high' })}
          >
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500" />
            High
          </Button>
          <Button
            variant={filterOptions.priority === 'medium' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ priority: 'medium' })}
          >
            <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
            Medium
          </Button>
          <Button
            variant={filterOptions.priority === 'low' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ priority: 'low' })}
          >
            <div className="mr-2 h-3 w-3 rounded-full bg-blue-500" />
            Low
          </Button>
        </div>
      </div>

      {/* Due Date Filter */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Due Date</h4>
        <div className="space-y-1">
          <Button
            variant={filterOptions.dueDate === 'all' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ dueDate: 'all' })}
          >
            All
          </Button>
          <Button
            variant={filterOptions.dueDate === 'overdue' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ dueDate: 'overdue' })}
          >
            <Clock className="mr-2 h-4 w-4 text-red-500" />
            Overdue
          </Button>
          <Button
            variant={filterOptions.dueDate === 'today' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ dueDate: 'today' })}
          >
            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
            Today
          </Button>
          <Button
            variant={filterOptions.dueDate === 'upcoming' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ dueDate: 'upcoming' })}
          >
            <Clock className="mr-2 h-4 w-4 text-blue-500" />
            Upcoming
          </Button>
          <Button
            variant={filterOptions.dueDate === 'no-date' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ dueDate: 'no-date' })}
          >
            <Clock className="mr-2 h-4 w-4 text-gray-400" />
            No due date
          </Button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Categories</h4>
        {categoriesLoading ? (
          <div className="text-sm text-muted-foreground">Loading categories...</div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-1">
            <Button
              variant={filterOptions.categoryId === null ? 'secondary' : 'outline'}
              size="sm"
              className="w-full justify-start text-sm h-8"
              onClick={() => onFilterChange({ categoryId: null })}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category._id}
                variant={filterOptions.categoryId === category._id ? 'secondary' : 'outline'}
                size="sm"
                className="w-full justify-start text-sm h-8"
                onClick={() => onFilterChange({ categoryId: category._id })}
              >
                <div
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No categories available</div>
        )}
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Sort By</h4>
        <div className="space-y-1">
          <Button
            variant={filterOptions.sortBy === 'created' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ sortBy: 'created' })}
          >
            Date Created
          </Button>
          <Button
            variant={filterOptions.sortBy === 'dueDate' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ sortBy: 'dueDate' })}
          >
            Due Date
          </Button>
          <Button
            variant={filterOptions.sortBy === 'priority' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ sortBy: 'priority' })}
          >
            Priority
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Sort Direction</h4>
        <div className="space-y-1">
          <Button
            variant={filterOptions.sortDirection === 'asc' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ sortDirection: 'asc' })}
          >
            <SortAsc className="mr-2 h-4 w-4" />
            Ascending
          </Button>
          <Button
            variant={filterOptions.sortDirection === 'desc' ? 'secondary' : 'outline'}
            size="sm"
            className="w-full justify-start text-sm h-8"
            onClick={() => onFilterChange({ sortDirection: 'desc' })}
          >
            <SortDesc className="mr-2 h-4 w-4" />
            Descending
          </Button>
        </div>
      </div>
    </div>
  );
};
