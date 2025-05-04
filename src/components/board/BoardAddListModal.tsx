import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface BoardAddListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    setTitle: (v: string) => void;
    onAdd: () => void;
}

const BoardAddListModal: React.FC<BoardAddListModalProps> = ({ open, onOpenChange, title, setTitle, onAdd }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add List</DialogTitle>
                <DialogDescription>Enter a title for the new list.</DialogDescription>
            </DialogHeader>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="List title" autoFocus />
            <DialogFooter>
                <Button onClick={onAdd}>Add</Button>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default BoardAddListModal; 