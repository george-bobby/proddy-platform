import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';

interface BoardAddCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    setTitle: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    labels: string;
    setLabels: (v: string) => void;
    priority: string;
    setPriority: (v: string) => void;
    onAdd: () => void;
}

const BoardAddCardModal: React.FC<BoardAddCardModalProps> = ({ open, onOpenChange, title, setTitle, description, setDescription, labels, setLabels, priority, setPriority, onAdd }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Card</DialogTitle>
                <DialogDescription>Enter details for the new card.</DialogDescription>
            </DialogHeader>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" autoFocus />
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" />
            <Input value={labels} onChange={e => setLabels(e.target.value)} placeholder="Labels (comma separated)" />
            <Select value={priority} onValueChange={v => setPriority(v as 'low' | 'medium' | 'high' | '')}>
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
                <Button onClick={onAdd}>Add</Button>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default BoardAddCardModal; 