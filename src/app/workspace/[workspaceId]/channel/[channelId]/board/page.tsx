'use client';

import { LayoutGrid } from 'lucide-react';

const BoardPage = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-y-4 bg-white">
            <LayoutGrid className="size-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Boards</h2>
            <p className="text-sm text-muted-foreground">Boards feature coming soon.</p>
        </div>
    );
};

export default BoardPage;