'use client';

import { Check, Loader, Plus, Tag } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Id } from '@/../convex/_generated/dataModel';

import { useCreateTaskCategory } from '../api/use-create-task-category';
import { useGetTaskCategories } from '../api/use-get-task-categories';

interface TaskCategorySelectorProps {
  workspaceId: Id<'workspaces'>;
  value: Id<'taskCategories'> | null;
  onChange: (value: Id<'taskCategories'> | null) => void;
}

export const TaskCategorySelector = ({
  workspaceId,
  value,
  onChange,
}: TaskCategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4A0D68');
  
  const { data: categories, isLoading } = useGetTaskCategories({ workspaceId });
  const createCategory = useCreateTaskCategory();
  
  const selectedCategory = categories?.find(category => category._id === value);
  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) return;
    
    try {
      const categoryId = await createCategory({
        name: newCategoryName,
        color: newCategoryColor,
        workspaceId,
      });
      
      onChange(categoryId);
      setNewCategoryName('');
      setNewCategoryColor('#4A0D68');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };
  
  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span>{selectedCategory.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select category</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-4 w-4 items-center justify-center">
                    {!value && <Check className="h-3 w-3" />}
                  </div>
                  <span>No category</span>
                </CommandItem>
                {isLoading ? (
                  <CommandItem disabled>
                    <Loader className="mr-2 h-3 w-3 animate-spin" />
                    Loading...
                  </CommandItem>
                ) : (
                  categories?.map((category) => (
                    <CommandItem
                      key={category._id}
                      onSelect={() => {
                        onChange(category._id);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {value === category._id && <Check className="h-3 w-3" />}
                      </div>
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create category
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your tasks.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateCategory}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="color" className="text-sm font-medium">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-6 w-6 rounded-full border" 
                    style={{ backgroundColor: newCategoryColor }}
                  />
                  <Input
                    id="color"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
