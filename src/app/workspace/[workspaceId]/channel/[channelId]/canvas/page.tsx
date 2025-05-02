'use client';

import { PaintBucket } from 'lucide-react';

const CanvasPage = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-y-4 bg-white">
            <PaintBucket className="size-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Canvas</h2>
            <p className="text-sm text-muted-foreground">Canvas feature coming soon.</p>
        </div>
    );
};

export default CanvasPage;