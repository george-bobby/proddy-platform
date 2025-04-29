'use client';

import { MessageSquareText } from 'lucide-react';

export default function ThreadsPage() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-white">
            <MessageSquareText className="size-12 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Threads</h2>
            <p className="text-sm text-muted-foreground">Your conversation threads will appear here.</p>
        </div>
    );
} 