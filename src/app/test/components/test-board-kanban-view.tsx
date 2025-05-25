'use client';

import React from 'react';
import { format } from 'date-fns';
import { Plus, MoreHorizontal, Calendar, User, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TestBoardKanbanViewProps {
  lists: any[];
  cardsByList: Record<string, any[]>;
  members: any[];
  onEditCard: (card: any) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: (listId: string) => void;
  onMoveCard: (cardId: string) => void;
  handleDragEnd: (event: any) => void;
}

export const TestBoardKanbanView = ({
  lists,
  cardsByList,
  members,
  onEditCard,
  onDeleteCard,
  onAddCard,
  onMoveCard,
  handleDragEnd,
}: TestBoardKanbanViewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'border-l-4 border-red-600 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-gray-400 bg-gray-50';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'highest': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m._id === memberId);
    return member?.user?.name || 'Unknown';
  };

  const getMemberInitials = (memberId: string) => {
    const name = getMemberName(memberId);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date();
  };

  const isDueSoon = (dueDate: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dueDate <= tomorrow && dueDate >= new Date();
  };

  return (
    <div className="flex h-full overflow-x-auto p-4 gap-4">
      {lists.map((list) => (
        <div key={list._id} className="flex-shrink-0 w-80">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {list.title}
                  <Badge variant="secondary" className="text-xs">
                    {cardsByList[list._id]?.length || 0}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddCard(list._id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-3">
                  {cardsByList[list._id]?.map((card) => (
                    <Card
                      key={card._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${getPriorityColor(card.priority)}`}
                      onClick={() => onEditCard(card)}
                    >
                      <CardContent className="p-4">
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-sm leading-tight">
                            {card.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditCard(card)}>
                                Edit Card
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onMoveCard(card._id)}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Move to Next List
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteCard(card._id)}
                                className="text-destructive"
                              >
                                Delete Card
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Card Description */}
                        {card.description && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {card.description}
                          </p>
                        )}

                        {/* Labels */}
                        {card.labels && card.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {card.labels.slice(0, 3).map((label: string) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                            {card.labels.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{card.labels.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Due Date */}
                        {card.dueDate && (
                          <div className="flex items-center gap-1 mb-3">
                            <Calendar className="h-3 w-3" />
                            <span className={`text-xs ${
                              isOverdue(card.dueDate) 
                                ? 'text-red-600 font-medium' 
                                : isDueSoon(card.dueDate)
                                ? 'text-orange-600 font-medium'
                                : 'text-muted-foreground'
                            }`}>
                              {format(card.dueDate, 'MMM d')}
                              {isOverdue(card.dueDate) && ' (Overdue)'}
                              {isDueSoon(card.dueDate) && !isOverdue(card.dueDate) && ' (Due Soon)'}
                            </span>
                          </div>
                        )}

                        {/* Priority and Assignees */}
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={getPriorityBadgeVariant(card.priority)} 
                            className="text-xs capitalize"
                          >
                            {card.priority === 'highest' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {card.priority}
                          </Badge>
                          
                          {card.assignees && card.assignees.length > 0 && (
                            <div className="flex -space-x-1">
                              {card.assignees.slice(0, 3).map((assigneeId: string) => (
                                <Avatar key={assigneeId} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-xs">
                                    {getMemberInitials(assigneeId)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {card.assignees.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                  <span className="text-xs text-gray-600">
                                    +{card.assignees.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Card Button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => onAddCard(list._id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a card
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};
