'use client';

import { SendHorizonal } from 'lucide-react';

export default function DraftsPage() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-white">
            <SendHorizonal className="size-12 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Drafts</h2>
            <p className="text-sm text-muted-foreground">Your draft messages will appear here.</p>
        </div>
    );
} 