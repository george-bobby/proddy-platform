import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';

interface BoardDeleteListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

const BoardDeleteListModal: React.FC<BoardDeleteListModalProps> = ({ open, onOpenChange, onDelete }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete List</DialogTitle>
                <DialogDescription>This will delete the list and all its cards. Are you sure?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={onDelete} variant="destructive">Delete</Button>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default BoardDeleteListModal; 