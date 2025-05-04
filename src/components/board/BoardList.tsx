import React from 'react';
import type { Id } from '../../convex/_generated/dataModel';
import { Pencil, Trash, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BoardCard from './BoardCard';

interface BoardListProps {
    list: any;
    cards: any[];
    onEditList: () => void;
    onDeleteList: () => void;
    onAddCard: () => void;
    onEditCard: (card: any) => void;
    onDeleteCard: (cardId: Id<'boardCards'>) => void;
}

const BoardList: React.FC<BoardListProps> = ({ list, cards, onEditList, onDeleteList, onAddCard, onEditCard, onDeleteCard }) => {
    return (
        <div className="bg-gray-100 rounded-lg shadow w-72 flex flex-col">
            <div className="p-3 font-bold border-b flex items-center justify-between">
                <span>{list.title}</span>
                <div className="flex gap-1">
                    <Button size="iconSm" variant="ghost" onClick={onEditList}><Pencil className="w-4 h-4" /></Button>
                    <Button size="iconSm" variant="ghost" onClick={onDeleteList}><Trash className="w-4 h-4" /></Button>
                </div>
            </div>
            <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 p-2 flex flex-col gap-2">
                    {cards.map(card => (
                        <BoardCard key={card._id} card={card} onEdit={() => onEditCard(card)} onDelete={() => onDeleteCard(card._id)} />
                    ))}
                </div>
            </SortableContext>
            <div className="p-2">
                <Button size="sm" variant="outline" className="w-full" onClick={onAddCard}><Plus className="w-4 h-4 mr-1" /> Add Card</Button>
            </div>
        </div>
    );
};

export default BoardList; 