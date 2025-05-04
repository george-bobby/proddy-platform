import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { LayoutGrid, Table, Plus } from 'lucide-react';
import BoardList from './BoardList';
import BoardAddListModal from './BoardAddListModal';
import BoardEditListModal from './BoardEditListModal';
import BoardDeleteListModal from './BoardDeleteListModal';
import BoardAddCardModal from './BoardAddCardModal';
import BoardEditCardModal from './BoardEditCardModal';
import { Button } from '../ui/button';
import type { Id } from '../../convex/_generated/dataModel';

const BoardView = ({ channelId }: { channelId: Id<'channels'> }) => {
    const lists = useQuery(api.board.getLists, { channelId });
    const allCards = useQuery(api.board.getAllCardsForChannel, { channelId }) || [];
    const [view, setView] = useState<'board' | 'table'>('board');

    // Modal state
    const [addListOpen, setAddListOpen] = useState(false);
    const [editListOpen, setEditListOpen] = useState(false);
    const [deleteListOpen, setDeleteListOpen] = useState(false);
    const [addCardOpen, setAddCardOpen] = useState<null | Id<'boardLists'>>(null);
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
    const [cardPriority, setCardPriority] = useState('');

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
        if (lists && lists.length === 0) {
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
    const handleAddCard = async (listId: Id<'boardLists'>) => {
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
        });
        setCardTitle('');
        setCardDesc('');
        setCardLabels('');
        setCardPriority('');
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
        });
        setEditCardOpen(null);
    };
    const handleDeleteCard = async (cardId: Id<'boardCards'>) => {
        await deleteCard({ cardId });
        setEditCardOpen(null);
    };

    // Drag-and-drop for lists and cards
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;
        // List reordering
        if (lists && lists.some(l => l._id === active.id) && lists.some(l => l._id === over.id)) {
            const oldIndex = lists.findIndex(l => l._id === active.id);
            const newIndex = lists.findIndex(l => l._id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;
            const newOrder = arrayMove(lists, oldIndex, newIndex).map((l, idx) => ({ listId: l._id, order: idx }));
            await reorderLists({ listOrders: newOrder });
            return;
        }
        // Card drag-and-drop
        let fromListId: Id<'boardLists'> | null = null;
        let toListId: Id<'boardLists'> | null = null;
        let fromIndex = -1;
        let toIndex = -1;
        let cardToMove: any = null;
        if (!lists) return;
        for (const list of lists) {
            const cards = cardsByList[list._id] || [];
            const idx = cards.findIndex((c: any) => c._id === active.id);
            if (idx !== -1) {
                fromListId = list._id;
                fromIndex = idx;
                cardToMove = cards[idx];
            }
            if (list._id === over.data?.current?.listId) {
                toListId = list._id;
                toIndex = over.data?.current?.index ?? 0;
            }
        }
        if (!cardToMove || !fromListId || !toListId) return;
        await moveCard({ cardId: cardToMove._id, toListId, order: toIndex });
    };

    if (!lists) return <div className="p-4">Loading board...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b bg-muted">
                <Button onClick={() => setView('board')} variant={view === 'board' ? 'default' : 'outline'}><LayoutGrid className="w-4 h-4 mr-1" /> Board View</Button>
                <Button onClick={() => setView('table')} variant={view === 'table' ? 'default' : 'outline'}><Table className="w-4 h-4 mr-1" /> Table View</Button>
                <Button variant="outline" className="ml-auto" onClick={() => setAddListOpen(true)}><Plus className="w-4 h-4 mr-1" /> Add List</Button>
            </div>
            {view === 'board' ? (
                <div className="flex flex-1 overflow-x-auto gap-4 p-4 bg-white">
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
                            {lists.map(list => (
                                <BoardList
                                    key={list._id}
                                    list={list}
                                    cards={cardsByList[list._id] || []}
                                    onEditList={() => {
                                        setListToEdit(list);
                                        setEditListTitle(list.title);
                                        setEditListOpen(true);
                                    }}
                                    onDeleteList={() => {
                                        setListToDelete(list);
                                        setDeleteListOpen(true);
                                    }}
                                    onAddCard={() => {
                                        setAddCardOpen(list._id);
                                        setCardTitle('');
                                        setCardDesc('');
                                        setCardLabels('');
                                        setCardPriority('');
                                    }}
                                    onEditCard={card => {
                                        setEditCardOpen({ card });
                                        setCardTitle(card.title);
                                        setCardDesc(card.description || '');
                                        setCardLabels((card.labels || []).join(', '));
                                        setCardPriority(card.priority || '');
                                    }}
                                    onDeleteCard={handleDeleteCard}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Table view coming soon</div>
            )}
            {/* Modals */}
            <BoardAddListModal open={addListOpen} onOpenChange={setAddListOpen} title={newListTitle} setTitle={setNewListTitle} onAdd={handleAddList} />
            <BoardEditListModal open={editListOpen} onOpenChange={setEditListOpen} title={editListTitle} setTitle={setEditListTitle} onSave={handleEditList} />
            <BoardDeleteListModal open={deleteListOpen} onOpenChange={setDeleteListOpen} onDelete={handleDeleteList} />
            <BoardAddCardModal open={!!addCardOpen} onOpenChange={open => { if (!open) { setAddCardOpen(null); setCardTitle(''); setCardDesc(''); setCardLabels(''); setCardPriority(''); } }} title={cardTitle} setTitle={setCardTitle} description={cardDesc} setDescription={setCardDesc} labels={cardLabels} setLabels={setCardLabels} priority={cardPriority} setPriority={setCardPriority} onAdd={() => addCardOpen && handleAddCard(addCardOpen)} />
            <BoardEditCardModal open={!!editCardOpen} onOpenChange={open => { if (!open) setEditCardOpen(null); }} title={cardTitle} setTitle={setCardTitle} description={cardDesc} setDescription={setCardDesc} labels={cardLabels} setLabels={setCardLabels} priority={cardPriority} setPriority={setCardPriority} onSave={handleEditCard} />
        </div>
    );
};

export default BoardView; 