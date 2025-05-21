'use client';

import React, { useState, useEffect } from 'react';
import { useChannelId } from '@/hooks/use-channel-id';
import { useQuery, useMutation } from 'convex/react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
    BoardAddListModal,
    BoardEditListModal,
    BoardDeleteListModal,
    BoardAddCardModal,
    BoardEditCardModal
} from '@/features/board/components/board-models';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import BoardKanbanView from '@/features/board/components/board-kanban-view';
import BoardTableView from '@/features/board/components/board-table-view';
import BoardGanttView from '@/features/board/components/board-gantt-view';
import BoardHeader from '@/features/board/components/board-header';
import { useDocumentTitle } from '@/hooks/use-document-title';

const BoardPage = () => {
    const channelId = useChannelId();
    const lists = useQuery(api.board.getLists, { channelId });
    const allCards = useQuery(api.board.getAllCardsForChannel, { channelId }) || [];
    const uniqueLabels = useQuery(api.board.getUniqueLabels, { channelId }) || [];
    const members = useQuery(api.board.getMembersForChannel, { channelId }) || [];
    const channel = useQuery(api.channels.get, { channelId });

    // Set document title based on channel name
    useDocumentTitle(channel ? `Board - ${channel.name}` : 'Board');
    const [view, setView] = useState<'kanban' | 'table' | 'gantt'>('kanban');

    // Modal state
    const [addListOpen, setAddListOpen] = useState(false);
    const [editListOpen, setEditListOpen] = useState(false);
    const [deleteListOpen, setDeleteListOpen] = useState(false);
    const [addCardOpen, setAddCardOpen] = useState<null | Id<'lists'>>(null);
    const [editCardOpen, setEditCardOpen] = useState<null | { card: any }>();

    // Form state
    const [newListTitle, setNewListTitle] = useState('');
    const [editListTitle, setEditListTitle] = useState('');
    const [listToEdit, setListToEdit] = useState<any>(null);
    const [listToDelete, setListToDelete] = useState<any>(null);

    // Card form state
    const [cardTitle, setCardTitle] = useState('');
    const [cardDesc, setCardDesc] = useState('');
    const [cardLabels, setCardLabels] = useState('');
    const [cardPriority, setCardPriority] = useState<'lowest' | 'low' | 'medium' | 'high' | 'highest' | ''>('');
    const [cardDueDate, setCardDueDate] = useState<Date | undefined>(undefined);
    const [cardAssignees, setCardAssignees] = useState<Id<'members'>[]>([]);

    // Mutations
    const createList = useMutation(api.board.createList);
    const updateList = useMutation(api.board.updateList);
    const deleteList = useMutation(api.board.deleteList);
    const reorderLists = useMutation(api.board.reorderLists);
    const createCard = useMutation(api.board.createCard);
    const updateCard = useMutation(api.board.updateCard);
    const deleteCard = useMutation(api.board.deleteCard);
    const moveCard = useMutation(api.board.moveCard);

    // Default lists on first load
    useEffect(() => {
        if (lists && lists.length === 0 && channelId) {
            const defaultLists = [
                { title: 'Planning', order: 0 },
                { title: 'Developing', order: 1 },
                { title: 'Reviewing', order: 2 },
                { title: 'Completed', order: 3 },
            ];
            defaultLists.forEach(async ({ title, order }) => {
                await createList({ channelId, title, order });
            });
        }
    }, [lists, channelId, createList]);

    // Group cards by list
    const cardsByList: Record<string, any[]> = {};
    allCards.forEach(card => {
        if (!cardsByList[card.listId]) cardsByList[card.listId] = [];
        cardsByList[card.listId].push(card);
    });

    // List handlers
    const handleAddList = async () => {
        if (!newListTitle.trim()) return;
        const order = lists ? lists.length : 0;
        await createList({ channelId, title: newListTitle, order });
        setNewListTitle('');
        setAddListOpen(false);
    };
    const handleEditList = async () => {
        if (!listToEdit || !editListTitle.trim()) return;
        await updateList({ listId: listToEdit._id, title: editListTitle });
        setEditListOpen(false);
        setListToEdit(null);
    };
    const handleDeleteList = async () => {
        if (!listToDelete) return;
        await deleteList({ listId: listToDelete._id });
        setDeleteListOpen(false);
        setListToDelete(null);
    };

    // Card handlers
    const handleAddCard = async (listId: Id<'lists'>) => {
        if (!cardTitle.trim()) return;
        const cards = cardsByList[listId] || [];
        const order = cards.length;
        await createCard({
            listId,
            title: cardTitle,
            description: cardDesc,
            order,
            labels: cardLabels.split(',').map(l => l.trim()).filter(Boolean),
            priority: cardPriority || undefined,
            dueDate: cardDueDate ? cardDueDate.getTime() : undefined,
            assignees: cardAssignees.length > 0 ? cardAssignees : undefined,
        });
        setCardTitle('');
        setCardDesc('');
        setCardLabels('');
        setCardPriority('');
        setCardDueDate(undefined);
        setCardAssignees([]);
        setAddCardOpen(null);
    };
    const handleEditCard = async () => {
        if (!editCardOpen || !cardTitle.trim()) return;
        await updateCard({
            cardId: editCardOpen.card._id,
            title: cardTitle,
            description: cardDesc,
            labels: cardLabels.split(',').map(l => l.trim()).filter(Boolean),
            priority: cardPriority || undefined,
            dueDate: cardDueDate ? cardDueDate.getTime() : undefined,
            assignees: cardAssignees.length > 0 ? cardAssignees : undefined,
        });
        setEditCardOpen(null);
    };
    const handleDeleteCard = async (cardId: Id<'cards'>) => {
        await deleteCard({ cardId });
        setEditCardOpen(null);
    };

    // Drag-and-drop for lists and cards
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over) {
            console.log('No active or over element');
            return;
        }

        // Log the drag event for debugging
        console.log('Drag end event:', {
            activeId: active.id,
            overId: over.id,
            activeType: active.data.current?.type,
            overType: over.data.current?.type,
            overData: over.data.current
        });

        // Get data from the dragged item
        const activeType = active.data.current?.type;

        // List reordering
        if (activeType === 'list' && lists) {
            const oldIndex = lists.findIndex(l => l._id === active.id);
            const newIndex = lists.findIndex(l => l._id === over.id);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                console.log(`Moving list from position ${oldIndex} to ${newIndex}`);

                // Create a new array with the reordered lists
                const reorderedLists = arrayMove([...lists], oldIndex, newIndex);

                // Update the order property for each list
                const newOrder = reorderedLists.map((list, idx) => ({
                    listId: list._id,
                    order: idx
                }));

                console.log('New list order:', newOrder);

                // Call the mutation to update the database
                try {
                    await reorderLists({ listOrders: newOrder });
                    console.log('Lists reordered successfully');
                } catch (error) {
                    console.error('Error reordering lists:', error);
                }
            }
            return;
        }

        // Card drag-and-drop
        if (activeType === 'card') {
            const cardId = active.id as Id<'cards'>;
            let fromListId: Id<'lists'> | null = null;
            let toListId: Id<'lists'> | null = null;

            // Find the source list
            for (const list of lists || []) {
                const cards = cardsByList[list._id] || [];
                if (cards.some(c => c._id === cardId)) {
                    fromListId = list._id;
                    break;
                }
            }

            // Determine the target list
            const overId = over.id.toString();

            // Check if dropped on a droppable area (list container)
            if (overId.startsWith('droppable-')) {
                toListId = overId.replace('droppable-', '') as Id<'lists'>;
                console.log('Dropped on droppable area:', toListId);
            }
            // Check if dropped on a list
            else if (over.data.current?.type === 'list') {
                toListId = over.data.current.listId || over.id as Id<'lists'>;
                console.log('Dropped on list:', toListId);
            }
            // Check if dropped on a card
            else if (over.data.current?.type === 'card') {
                // Find the list that contains this card
                const overCardId = over.id;
                for (const list of lists || []) {
                    const cards = cardsByList[list._id] || [];
                    if (cards.some(c => c._id === overCardId)) {
                        toListId = list._id;
                        console.log('Dropped on card in list:', toListId);
                        break;
                    }
                }
            }

            console.log('Move card:', { cardId, fromListId, toListId });

            if (fromListId && toListId) {
                // Calculate the new order
                const targetCards = cardsByList[toListId] || [];
                let newOrder = 0;

                // If dropped on a card, place it at that card's position
                if (over.data.current?.type === 'card') {
                    const overCardIndex = targetCards.findIndex(c => c._id === over.id);
                    if (overCardIndex !== -1) {
                        newOrder = overCardIndex;
                    }
                } else {
                    // If dropped directly on a list, place at the end
                    newOrder = targetCards.length;
                }

                console.log('Moving card to position:', newOrder);

                try {
                    await moveCard({
                        cardId,
                        toListId,
                        order: newOrder
                    });
                    console.log('Card moved successfully');
                } catch (error) {
                    console.error('Error moving card:', error);
                }
            } else {
                console.warn('Could not determine source or target list');
            }
        }
    };

    if (!channelId) return <div className="p-4">No channel selected.</div>;
    if (!lists) return <div className="p-4">Loading board...</div>;

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <style jsx global>{`
              ::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <BoardHeader
                totalCards={allCards.length}
                listsCount={lists?.length || 0}
                view={view}
                setView={setView}
                onAddList={() => setAddListOpen(true)}
                onSearch={(query) => console.log('Search:', query)}
            />

            <div className="flex-1 overflow-hidden overflow-x-hidden scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {view === 'kanban' && (
                    <BoardKanbanView
                        lists={lists}
                        cardsByList={cardsByList}
                        onEditList={(list) => {
                            setListToEdit(list);
                            setEditListTitle(list.title);
                            setEditListOpen(true);
                        }}
                        onDeleteList={(list) => {
                            setListToDelete(list);
                            setDeleteListOpen(true);
                        }}
                        onAddCard={(listId) => {
                            setAddCardOpen(listId);
                            setCardTitle('');
                            setCardDesc('');
                            setCardLabels('');
                            setCardPriority('');
                        }}
                        onEditCard={(card) => {
                            setEditCardOpen({ card });
                            setCardTitle(card.title);
                            setCardDesc(card.description || '');
                            setCardLabels((card.labels || []).join(', '));
                            setCardPriority(card.priority || '');
                            setCardDueDate(card.dueDate ? new Date(card.dueDate) : undefined);
                            setCardAssignees(card.assignees || []);
                        }}
                        onDeleteCard={handleDeleteCard}
                        handleDragEnd={handleDragEnd}
                        members={members}
                    />
                )}

                {view === 'table' && (
                    <BoardTableView
                        lists={lists}
                        allCards={allCards}
                        onEditCard={(card) => {
                            setEditCardOpen({ card });
                            setCardTitle(card.title);
                            setCardDesc(card.description || '');
                            setCardLabels((card.labels || []).join(', '));
                            setCardPriority(card.priority || '');
                            setCardDueDate(card.dueDate ? new Date(card.dueDate) : undefined);
                            setCardAssignees(card.assignees || []);
                        }}
                        onDeleteCard={handleDeleteCard}
                        members={members}
                    />
                )}

                {view === 'gantt' && (
                    <BoardGanttView
                        lists={lists}
                        allCards={allCards}
                        onEditCard={(card) => {
                            setEditCardOpen({ card });
                            setCardTitle(card.title);
                            setCardDesc(card.description || '');
                            setCardLabels((card.labels || []).join(', '));
                            setCardPriority(card.priority || '');
                            setCardDueDate(card.dueDate ? new Date(card.dueDate) : undefined);
                            setCardAssignees(card.assignees || []);
                        }}
                        onDeleteCard={handleDeleteCard}
                        members={members}
                    />
                )}
            </div>

            {/* Modals */}
            <BoardAddListModal open={addListOpen} onOpenChange={setAddListOpen} title={newListTitle} setTitle={setNewListTitle} onAdd={handleAddList} />
            <BoardEditListModal open={editListOpen} onOpenChange={setEditListOpen} title={editListTitle} setTitle={setEditListTitle} onSave={handleEditList} />
            <BoardDeleteListModal open={deleteListOpen} onOpenChange={setDeleteListOpen} onDelete={handleDeleteList} />
            <BoardAddCardModal
                open={!!addCardOpen}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setAddCardOpen(null);
                        setCardTitle('');
                        setCardDesc('');
                        setCardLabels('');
                        setCardPriority('');
                        setCardDueDate(undefined);
                        setCardAssignees([]);
                    }
                }}
                title={cardTitle}
                setTitle={setCardTitle}
                description={cardDesc}
                setDescription={setCardDesc}
                labels={cardLabels}
                setLabels={setCardLabels}
                priority={cardPriority}
                setPriority={setCardPriority}
                dueDate={cardDueDate}
                setDueDate={setCardDueDate}
                assignees={cardAssignees}
                setAssignees={setCardAssignees}
                members={members}
                labelSuggestions={uniqueLabels}
                onAdd={() => addCardOpen && handleAddCard(addCardOpen)}
            />
            <BoardEditCardModal
                open={!!editCardOpen}
                onOpenChange={(open: boolean) => {
                    if (!open) setEditCardOpen(null);
                }}
                title={cardTitle}
                setTitle={setCardTitle}
                description={cardDesc}
                setDescription={setCardDesc}
                labels={cardLabels}
                setLabels={setCardLabels}
                priority={cardPriority}
                setPriority={setCardPriority}
                dueDate={cardDueDate}
                setDueDate={setCardDueDate}
                assignees={cardAssignees}
                setAssignees={setCardAssignees}
                members={members}
                labelSuggestions={uniqueLabels}
                onSave={handleEditCard}
            />
        </div>
    );
};

export default BoardPage;