import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface BoardEditListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    setTitle: (v: string) => void;
    onSave: () => void;
}

const BoardEditListModal: React.FC<BoardEditListModalProps> = ({ open, onOpenChange, title, setTitle, onSave }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit List</DialogTitle>
            </DialogHeader>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="List title" autoFocus />
            <DialogFooter>
                <Button onClick={onSave}>Save</Button>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default BoardEditListModal; 