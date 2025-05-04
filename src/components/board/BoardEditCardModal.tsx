import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';

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

const BoardEditCardModal: React.FC<BoardEditCardModalProps> = ({ open, onOpenChange, title, setTitle, description, setDescription, labels, setLabels, priority, setPriority, onSave }) => (
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

export default BoardEditCardModal; 