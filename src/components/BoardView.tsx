import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from './ui/dialog';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Pencil, Trash, Plus, LayoutGrid, Table } from 'lucide-react';
import { Badge } from './ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';

interface BoardViewProps {
    channelId: Id<'channels'>;
}

// Sortable Card component
function CardSortable({ card, onEdit, onDelete }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            {...attributes}
            {...listeners}
            className="bg-white rounded-lg shadow p-3 flex flex-col gap-1 border hover:border-primary/40 cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-sm truncate">{card.title}</span>
                <div className="flex gap-1">
                    <Button size="iconSm" variant="ghost" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
                    <Button size="iconSm" variant="ghost" onClick={onDelete}><Trash className="w-4 h-4" /></Button>
                </div>
            </div>
            {card.description && <div className="text-xs text-muted-foreground truncate">{card.description}</div>}
            <div className="flex flex-wrap gap-1 mb-1">
                {Array.isArray(card.labels) && card.labels.map((label: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">{label}</Badge>
                ))}
                {card.priority && (
                    <Badge variant={
                        card.priority === 'high' ? 'destructive' : card.priority === 'medium' ? 'secondary' : 'outline'
                    } className="text-xs px-2 py-0.5">
                        {card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                    </Badge>
                )}
            </div>
        </div>
    );
}

// Sortable List wrapper
function ListSortable({ listId, children }: { listId: Id<'boardLists'>; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: listId });
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1 }}
            {...attributes}
            {...listeners}
            className="w-72 flex flex-col"
        >
            {children}
        </div>
    );
}

export const BoardView: React.FC<BoardViewProps> = ({ channelId }) => {
    const lists = useQuery(api.board.getLists, { channelId });
    const [view, setView] = useState<'board' | 'table'>('board');
    const [addListOpen, setAddListOpen] = useState(false);
    const [addCardOpen, setAddCardOpen] = useState<null | Id<'boardLists'>>(null);
    const [editCard, setEditCard] = useState<null | { cardId: Id<'boardCards'>; listId: Id<'boardLists'>; title: string; description?: string }>(null);
    const [editList, setEditList] = useState<null | { listId: Id<'boardLists'>; title: string }>(null);
    const [deleteListId, setDeleteListId] = useState<null | Id<'boardLists'>>(null);
    const [newListTitle, setNewListTitle] = useState('');
    const [editListTitle, setEditListTitle] = useState('');
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardDesc, setNewCardDesc] = useState('');
    const [newCardLabels, setNewCardLabels] = useState<string>('');
    const [newCardPriority, setNewCardPriority] = useState<'low' | 'medium' | 'high' | ''>('');
    const [editCardTitle, setEditCardTitle] = useState('');
    const [editCardDesc, setEditCardDesc] = useState('');
    const [editCardLabels, setEditCardLabels] = useState<string>('');
    const [editCardPriority, setEditCardPriority] = useState<'low' | 'medium' | 'high' | ''>('');

    const createList = useMutation(api.board.createList);
    const updateList = useMutation(api.board.updateList);
    const deleteList = useMutation(api.board.deleteList);
    const reorderLists = useMutation(api.board.reorderLists);
    const createCard = useMutation(api.board.createCard);
    const updateCard = useMutation(api.board.updateCard);
    const deleteCard = useMutation(api.board.deleteCard);
    const moveCard = useMutation(api.board.moveCard);

    // Create default lists if none exist
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

    // Gather all cards for all lists at the top level
    const allCards = useQuery(api.board.getAllCardsForChannel, { channelId }) || [];
    const cardsByList: Record<string, any[]> = {};
    allCards.forEach(card => {
        if (!cardsByList[card.listId]) cardsByList[card.listId] = [];
        cardsByList[card.listId].push(card);
    });

    // Add new list
    const handleAddList = async () => {
        if (!newListTitle.trim()) return;
        const order = lists ? lists.length : 0;
        await createList({ channelId, title: newListTitle, order });
        setNewListTitle('');
        setAddListOpen(false);
    };

    // Edit list
    const handleEditList = async () => {
        if (!editList || !editListTitle.trim()) return;
        await updateList({ listId: editList.listId, title: editListTitle });
        setEditList(null);
    };

    // Delete list
    const handleDeleteList = async () => {
        if (!deleteListId) return;
        await deleteList({ listId: deleteListId });
        setDeleteListId(null);
    };

    // Add new card
    const handleAddCard = async (listId: Id<'boardLists'>) => {
        if (!newCardTitle.trim()) return;
        const cards = cardsByList[listId] || [];
        const order = cards.length;
        await createCard({
            listId,
            title: newCardTitle,
            description: newCardDesc,
            order,
            labels: newCardLabels.split(',').map(l => l.trim()).filter(Boolean),
            priority: newCardPriority || undefined,
        });
        setNewCardTitle('');
        setNewCardDesc('');
        setNewCardLabels('');
        setNewCardPriority('');
        setAddCardOpen(null);
    };

    // Edit card
    const handleEditCard = async () => {
        if (!editCard || !editCardTitle.trim()) return;
        await updateCard({
            cardId: editCard.cardId,
            title: editCardTitle,
            description: editCardDesc,
            labels: editCardLabels.split(',').map(l => l.trim()).filter(Boolean),
            priority: editCardPriority || undefined,
        });
        setEditCard(null);
    };

    // Delete card
    const handleDeleteCard = async (cardId: Id<'boardCards'>) => {
        await deleteCard({ cardId });
        setEditCard(null);
    };

    // Drag-and-drop for cards and lists
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;
        // Handle list reordering
        if (lists && lists.some(l => l._id === active.id) && lists.some(l => l._id === over.id)) {
            const oldIndex = lists.findIndex(l => l._id === active.id);
            const newIndex = lists.findIndex(l => l._id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;
            const newOrder = arrayMove(lists, oldIndex, newIndex).map((l, idx) => ({ listId: l._id, order: idx }));
            await reorderLists({ listOrders: newOrder });
            return;
        }
        // Handle card drag-and-drop (existing logic)
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
        if (fromListId === toListId) {
            await moveCard({ cardId: cardToMove._id, toListId, order: toIndex });
        } else {
            await moveCard({ cardId: cardToMove._id, toListId, order: toIndex });
        }
    };

    if (!lists) {
        return <div className="p-4">Loading board...</div>;
    }

    // TableView implementation
    if (view === 'table') {
        // Gather all cards
        const allCards: { card: any; list: any }[] = [];
        for (const list of lists) {
            const cards = cardsByList[list._id] || [];
            cards.forEach(card => allCards.push({ card, list }));
        }
        return (
            <div className="flex-1 p-6 overflow-auto">
                <div className="mb-4 flex items-center gap-2">
                    <Button onClick={() => setView('board')} variant="outline"><LayoutGrid className="w-4 h-4 mr-1" /> Back to Board</Button>
                    <span className="text-lg font-semibold">Table View</span>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="min-w-[600px] w-full border rounded-lg bg-white shadow">
                        <thead>
                            <tr className="bg-muted text-left">
                                <th className="p-3 font-semibold">Card Title</th>
                                <th className="p-3 font-semibold">Description</th>
                                <th className="p-3 font-semibold">List</th>
                                <th className="p-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCards.map(({ card, list }) => (
                                <tr key={card._id} className="border-b hover:bg-accent/20">
                                    <td className="p-3 font-medium">{card.title}</td>
                                    <td className="p-3 text-muted-foreground">{card.description}</td>
                                    <td className="p-3">{list.title}</td>
                                    <td className="p-3 flex gap-2">
                                        <Button size="iconSm" variant="ghost" onClick={() => {
                                            setEditCard({ cardId: card._id, listId: list._id, title: card.title, description: card.description });
                                            setEditCardTitle(card.title);
                                            setEditCardDesc(card.description || '');
                                            setEditCardLabels((card.labels || []).join(', '));
                                            setEditCardPriority(card.priority || '');
                                        }}><Pencil className="w-4 h-4" /></Button>
                                        <Button size="iconSm" variant="ghost" onClick={() => handleDeleteCard(card._id)}><Trash className="w-4 h-4" /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Edit Card Modal (TableView) */}
                {editCard && (
                    <Dialog open={!!editCard} onOpenChange={open => { if (!open) setEditCard(null); }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Card</DialogTitle>
                            </DialogHeader>
                            <Input value={editCardTitle} onChange={e => setEditCardTitle(e.target.value)} placeholder="Card title" autoFocus />
                            <Input value={editCardDesc} onChange={e => setEditCardDesc(e.target.value)} placeholder="Description (optional)" />
                            <Input value={editCardLabels} onChange={e => setEditCardLabels(e.target.value)} placeholder="Labels (comma separated)" />
                            <Select value={editCardPriority} onValueChange={v => setEditCardPriority(v as 'low' | 'medium' | 'high' | '')}>
                                <SelectTrigger className="w-full mt-2">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <DialogFooter>
                                <Button onClick={handleEditCard}>Save</Button>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 p-2 border-b bg-muted">
                <Button onClick={() => setView('board')} variant={view === 'board' ? 'default' : 'outline'}><LayoutGrid className="w-4 h-4 mr-1" /> Board View</Button>
                <Button onClick={() => setView('table')} variant={view === 'table' ? 'default' : 'outline'}><Table className="w-4 h-4 mr-1" /> Table View</Button>
            </div>
            <div className="flex flex-1 overflow-x-auto gap-4 p-4 bg-white">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
                        {lists.map(list => {
                            const cards = cardsByList[list._id] || [];
                            return (
                                <ListSortable key={list._id} listId={list._id}>
                                    <div className="bg-gray-100 rounded-lg shadow w-72 flex flex-col">
                                        <div className="p-3 font-bold border-b flex items-center justify-between">
                                            <span>{list.title}</span>
                                            <div className="flex gap-1">
                                                <Button size="iconSm" variant="ghost" onClick={() => { setEditList({ listId: list._id, title: list.title }); setEditListTitle(list.title); }}><Pencil className="w-4 h-4" /></Button>
                                                <Button size="iconSm" variant="ghost" onClick={() => setDeleteListId(list._id)}><Trash className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                        <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                                            <div className="flex-1 p-2 flex flex-col gap-2">
                                                {cards.map((card, idx) => (
                                                    <CardSortable
                                                        key={card._id}
                                                        card={card}
                                                        onEdit={() => {
                                                            setEditCard({ cardId: card._id, listId: list._id, title: card.title, description: card.description });
                                                            setEditCardTitle(card.title);
                                                            setEditCardDesc(card.description || '');
                                                            setEditCardLabels((card.labels || []).join(', '));
                                                            setEditCardPriority(card.priority || '');
                                                        }}
                                                        onDelete={() => handleDeleteCard(card._id)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                        <div className="p-2">
                                            <Button size="sm" variant="outline" className="w-full" onClick={() => setAddCardOpen(list._id)}><Plus className="w-4 h-4 mr-1" /> Add Card</Button>
                                        </div>
                                    </div>
                                </ListSortable>
                            );
                        })}
                        {/* Add new list button */}
                        <div className="w-72 flex items-center justify-center">
                            <Dialog open={addListOpen} onOpenChange={setAddListOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Plus className="w-4 h-4 mr-1" /> Add List</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add List</DialogTitle>
                                        <DialogDescription>Enter a title for the new list.</DialogDescription>
                                    </DialogHeader>
                                    <Input value={newListTitle} onChange={e => setNewListTitle(e.target.value)} placeholder="List title" autoFocus />
                                    <DialogFooter>
                                        <Button onClick={handleAddList}>Add</Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {/* Add Card Modal (per list) */}
                        {lists.map(list => (
                            <Dialog key={list._id + '-add-card'} open={addCardOpen === list._id} onOpenChange={open => { if (!open) { setAddCardOpen(null); setNewCardTitle(''); setNewCardDesc(''); setNewCardLabels(''); setNewCardPriority(''); } }}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Card</DialogTitle>
                                        <DialogDescription>Enter details for the new card.</DialogDescription>
                                    </DialogHeader>
                                    <Input value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} placeholder="Card title" autoFocus />
                                    <Input value={newCardDesc} onChange={e => setNewCardDesc(e.target.value)} placeholder="Description (optional)" />
                                    <Input value={newCardLabels} onChange={e => setNewCardLabels(e.target.value)} placeholder="Labels (comma separated)" />
                                    <Select value={newCardPriority} onValueChange={v => setNewCardPriority(v as 'low' | 'medium' | 'high' | '')}>
                                        <SelectTrigger className="w-full mt-2">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <DialogFooter>
                                        <Button onClick={() => handleAddCard(list._id)}>Add</Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        ))}
                        {/* Edit Card Modal */}
                        {editCard && (
                            <Dialog open={!!editCard} onOpenChange={open => { if (!open) setEditCard(null); }}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Card</DialogTitle>
                                    </DialogHeader>
                                    <Input value={editCardTitle} onChange={e => setEditCardTitle(e.target.value)} placeholder="Card title" autoFocus />
                                    <Input value={editCardDesc} onChange={e => setEditCardDesc(e.target.value)} placeholder="Description (optional)" />
                                    <Input value={editCardLabels} onChange={e => setEditCardLabels(e.target.value)} placeholder="Labels (comma separated)" />
                                    <Select value={editCardPriority} onValueChange={v => setEditCardPriority(v as 'low' | 'medium' | 'high' | '')}>
                                        <SelectTrigger className="w-full mt-2">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <DialogFooter>
                                        <Button onClick={handleEditCard}>Save</Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {/* Edit List Modal */}
                        {editList && (
                            <Dialog open={!!editList} onOpenChange={open => { if (!open) setEditList(null); }}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit List</DialogTitle>
                                    </DialogHeader>
                                    <Input value={editListTitle} onChange={e => setEditListTitle(e.target.value)} placeholder="List title" autoFocus />
                                    <DialogFooter>
                                        <Button onClick={handleEditList}>Save</Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {/* Delete List Confirm Modal */}
                        {deleteListId && (
                            <Dialog open={!!deleteListId} onOpenChange={open => { if (!open) setDeleteListId(null); }}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete List</DialogTitle>
                                        <DialogDescription>This will delete the list and all its cards. Are you sure?</DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button onClick={handleDeleteList} variant="destructive">Delete</Button>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}; 