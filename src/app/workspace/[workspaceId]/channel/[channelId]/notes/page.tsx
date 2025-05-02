'use client';

import { FileText } from 'lucide-react';

const NotesPage = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-y-4 bg-white">
            <FileText className="size-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Notes</h2>
            <p className="text-sm text-muted-foreground">Notes feature coming soon.</p>
        </div>
    );
};

export default NotesPage;