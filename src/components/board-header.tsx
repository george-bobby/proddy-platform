import React, { useState } from 'react';
import { Search, Filter, LayoutGrid, Table, BarChart, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BoardHeaderProps {
  title?: string;
  totalCards: number;
  listsCount: number;
  view: 'board' | 'table';
  setView: (view: 'board' | 'table') => void;
  onAddList: () => void;
  onSearch?: (query: string) => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  totalCards,
  listsCount,
  view,
  setView,
  onAddList,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col gap-3 p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <LayoutGrid className="w-4 h-4" />
              <span>{listsCount} lists</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="w-4 h-4" />
              <span>{totalCards} cards</span>
            </div>
            <Badge variant="outline" className="bg-white/50">
              <Clock className="w-3 h-3 mr-1" /> Updated just now
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 bg-white" onClick={onAddList}>
                  <span className="hidden md:inline mr-1">Add List</span>+
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new list to the board</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 bg-white">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Cards</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <span>By Priority</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>By Label</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>By Due Date</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Clear Filters</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            className="pl-9 bg-white/80 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-3 bg-white/80 p-1 rounded-md border shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <Switch
              id="view-switch"
              checked={view === 'table'}
              onCheckedChange={(checked: boolean) => setView(checked ? 'table' : 'board')}
              className="data-[state=checked]:bg-secondary"
            />
            <Label htmlFor="view-switch" className="flex items-center gap-1.5 text-sm font-medium">
              {view === 'board' ? (
                <><LayoutGrid className="w-4 h-4 text-primary" /> Board</>
              ) : (
                <><Table className="w-4 h-4 text-secondary" /> Table</>
              )}
            </Label>
          </div>

          <div className="h-6 w-px bg-border"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("px-2 py-1", view === 'board' && "bg-primary/10")}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Board View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("px-2 py-1", view === 'table' && "bg-secondary/10")}>
                  <Table className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Table View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 py-1">
                  <Calendar className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Calendar View (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
