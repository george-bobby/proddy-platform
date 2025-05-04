'use client';

import React, { useState, useEffect } from 'react';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TimelineMarkers,
  TodayMarker,
  CursorMarker
} from 'react-calendar-timeline';
import 'react-calendar-timeline/style.css';
import '@/styles/gantt-chart.css';
import moment from 'moment';
import { Pencil, Trash } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface BoardGanttViewProps {
  lists: any[];
  allCards: any[];
  onEditCard: (card: any) => void;
  onDeleteCard: (cardId: Id<'cards'>) => void;
}

const BoardGanttView: React.FC<BoardGanttViewProps> = ({
  lists,
  allCards,
  onEditCard,
  onDeleteCard
}) => {
  // Filter cards with due dates
  const cardsWithDueDate = allCards.filter(card => card.dueDate);

  // Prepare data for the timeline
  const groups = lists.map((list, index) => ({
    id: list._id,
    title: list.title,
    stackItems: true
  }));

  // Create items for the timeline
  const items = cardsWithDueDate.map(card => {
    // Calculate end time (default to 1 hour after due date if not specified)
    const startTime = moment(card.dueDate);
    const endTime = moment(card.dueDate).add(1, 'hour');

    return {
      id: card._id,
      group: card.listId,
      title: card.title,
      start_time: startTime,
      end_time: endTime,
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        className: `priority-${card.priority || 'none'}`,
        style: {
          background: getPriorityColor(card.priority),
          color: getPriorityTextColor(card.priority),
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          padding: '4px'
        }
      }
    };
  });

  // Set default time range (1 month before and after today)
  const defaultTimeStart = moment().add(-1, 'month').valueOf();
  const defaultTimeEnd = moment().add(1, 'month').valueOf();
  const [timeRange, setTimeRange] = useState({
    visibleTimeStart: defaultTimeStart,
    visibleTimeEnd: defaultTimeEnd
  });

  // Handle time change
  const handleTimeChange = (visibleTimeStart: number, visibleTimeEnd: number) => {
    setTimeRange({ visibleTimeStart, visibleTimeEnd });
  };

  // Get the mutation to update cards in Gantt view
  const updateCardInGantt = useMutation(api.board.updateCardInGantt);

  // Handle item move
  const handleItemMove = (itemId: Id<'cards'>, dragTime: number, newGroupOrder: number) => {
    console.log('Item moved', { itemId, dragTime, newGroupOrder });

    // Get the new list ID from the group order
    const newListId = groups[newGroupOrder]?.id as Id<'lists'>;

    // Update the card with new due date and list
    if (newListId) {
      updateCardInGantt({
        cardId: itemId,
        dueDate: dragTime,
        listId: newListId
      });
    }
  };

  // Handle item resize
  const handleItemResize = (itemId: Id<'cards'>, time: number, edge: string) => {
    console.log('Item resized', { itemId, time, edge });

    // Update the card's due date
    // For left edge resize, we update the start time
    // For right edge resize, we don't need to update anything as we only track start time
    if (edge === 'left') {
      updateCardInGantt({
        cardId: itemId,
        dueDate: time
      });
    }
  };

  // Get priority color
  function getPriorityColor(priority: string | undefined) {
    switch (priority) {
      case 'highest':
        return 'rgba(239, 68, 68, 0.2)';
      case 'high':
        return 'rgba(249, 115, 22, 0.2)';
      case 'medium':
        return 'rgba(237, 18, 142, 0.2)';
      case 'low':
        return 'rgba(59, 130, 246, 0.2)';
      case 'lowest':
        return 'rgba(74, 13, 104, 0.1)';
      default:
        return 'rgba(229, 231, 235, 0.5)';
    }
  }

  // Get priority text color
  function getPriorityTextColor(priority: string | undefined) {
    switch (priority) {
      case 'highest':
        return 'rgb(185, 28, 28)';
      case 'high':
        return 'rgb(194, 65, 12)';
      case 'medium':
        return 'rgb(157, 23, 77)';
      case 'low':
        return 'rgb(29, 78, 216)';
      case 'lowest':
        return 'rgb(74, 13, 104)';
      default:
        return 'rgb(55, 65, 81)';
    }
  }

  // Custom item renderer
  const itemRenderer = ({ item, itemContext, getItemProps, getResizeProps }: any) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    const card = allCards.find(c => c._id === item.id);

    return (
      <div {...getItemProps(item.itemProps)}>
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

        <div className="flex justify-between items-center w-full px-1">
          <div className="truncate text-xs font-medium">{itemContext.title}</div>

          <div className="flex gap-1 ml-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="iconXs"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card) onEditCard(card);
                    }}
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Card</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="iconXs"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCard(item.id);
                    }}
                  >
                    <Trash className="h-2.5 w-2.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Card</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
      </div>
    );
  };

  // Calculate zoom level buttons
  const zoomLevels = [
    { label: 'Day', value: 1 * 24 * 60 * 60 * 1000 },
    { label: 'Week', value: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Month', value: 30 * 24 * 60 * 60 * 1000 },
    { label: 'Quarter', value: 90 * 24 * 60 * 60 * 1000 },
  ];

  // Function to handle zoom level change
  const handleZoomChange = (zoomValue: number) => {
    const currentMiddle = (timeRange.visibleTimeStart + timeRange.visibleTimeEnd) / 2;
    const newVisibleTimeStart = currentMiddle - zoomValue / 2;
    const newVisibleTimeEnd = currentMiddle + zoomValue / 2;
    setTimeRange({
      visibleTimeStart: newVisibleTimeStart,
      visibleTimeEnd: newVisibleTimeEnd
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar for Gantt chart */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Zoom:</span>
          <div className="flex items-center gap-1">
            {zoomLevels.map((level) => (
              <Button
                key={level.label}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleZoomChange(level.value)}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {items.length} tasks • {groups.length} lists
        </div>
      </div>

      {/* Timeline component */}
      <div className="flex-1 overflow-hidden">
        <Timeline
          groups={groups}
          items={items}
          visibleTimeStart={timeRange.visibleTimeStart}
          visibleTimeEnd={timeRange.visibleTimeEnd}
          onTimeChange={handleTimeChange}
          onItemMove={handleItemMove}
          onItemResize={handleItemResize}
          itemRenderer={itemRenderer}
          stackItems
          sidebarWidth={180}
          lineHeight={44}
          itemHeightRatio={0.65}
          canMove={true}
          canResize="both"
          canChangeGroup={true}
          minZoom={24 * 60 * 60 * 1000} // 1 day
          maxZoom={365 * 24 * 60 * 60 * 1000} // 1 year
          traditionalZoom
          horizontalLineClassNamesForGroup={(group) => ["bg-gray-50"]}
        >
          <TimelineHeaders className="border-b">
            <SidebarHeader>
              {({ getRootProps }) => {
                return (
                  <div
                    {...getRootProps()}
                    className="font-medium text-sm px-4 py-2 bg-gray-100 flex items-center"
                  >
                    Lists / Tasks
                  </div>
                );
              }}
            </SidebarHeader>
            <DateHeader
              unit="primaryHeader"
              className="bg-gray-100 text-sm font-medium"
            />
            <DateHeader
              className="text-xs"
            />
          </TimelineHeaders>
          <TimelineMarkers>
            <TodayMarker>
              {({ styles }) => (
                <div
                  style={{
                    ...styles,
                    backgroundColor: 'rgba(237, 18, 142, 0.3)',
                    width: '2px'
                  }}
                />
              )}
            </TodayMarker>
            <CursorMarker>
              {({ styles }) => (
                <div
                  style={{
                    ...styles,
                    backgroundColor: 'rgba(74, 13, 104, 0.4)',
                    width: '1px'
                  }}
                />
              )}
            </CursorMarker>
          </TimelineMarkers>
        </Timeline>
      </div>
    </div>
  );
};

export default BoardGanttView;
