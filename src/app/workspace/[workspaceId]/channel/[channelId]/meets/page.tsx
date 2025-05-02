'use client';

import { Video } from 'lucide-react';

const MeetsPage = () => {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-y-4 bg-white">
            <Video className="size-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Meets</h2>
            <p className="text-sm text-muted-foreground">Video meetings feature coming soon.</p>
        </div>
    );
};

export default MeetsPage;