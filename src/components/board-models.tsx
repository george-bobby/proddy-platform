import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import type { Id } from '../../convex/_generated/dataModel';

// BoardAddListModal
interface BoardAddListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    setTitle: (v: string) => void;
    onAdd: () => void;
}

export const BoardAddListModal: React.FC<BoardAddListModalProps> = ({ open, onOpenChange, title, setTitle, onAdd }) => (
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

// BoardEditListModal
interface BoardEditListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    setTitle: (v: string) => void;
    onSave: () => void;
}

export const BoardEditListModal: React.FC<BoardEditListModalProps> = ({ open, onOpenChange, title, setTitle, onSave }) => (
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

// BoardDeleteListModal
interface BoardDeleteListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

export const BoardDeleteListModal: React.FC<BoardDeleteListModalProps> = ({ open, onOpenChange, onDelete }) => (
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

// BoardAddCardModal
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

export const BoardAddCardModal: React.FC<BoardAddCardModalProps> = ({ open, onOpenChange, title, setTitle, description, setDescription, labels, setLabels, priority, setPriority, onAdd }) => (
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

// BoardEditCardModal
interface BoardEditCardModalProps {
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
    onSave: () => void;
}

export const BoardEditCardModal: React.FC<BoardEditCardModalProps> = ({ open, onOpenChange, title, setTitle, description, setDescription, labels, setLabels, priority, setPriority, onSave }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Card</DialogTitle>
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
                <Button onClick={onSave}>Save</Button>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);
