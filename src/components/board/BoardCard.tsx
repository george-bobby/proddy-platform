import React from 'react';
import { Pencil, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface BoardCardProps {
    card: any;
    onEdit: () => void;
    onDelete: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ card, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow p-3 flex flex-col gap-1 border hover:border-primary/40 cursor-pointer">
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
};

export default BoardCard; 