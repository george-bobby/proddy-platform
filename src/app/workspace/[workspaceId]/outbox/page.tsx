'use client';

import { format } from 'date-fns';
import { Mail, Loader } from 'lucide-react';
import Link from 'next/link';

import type { Id } from '@/../convex/_generated/dataModel';
import { useGetUserMessages } from '@/features/messages/api/use-get-user-messages';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

interface Message {
    _id: Id<'messages'>;
    _creationTime: number;
    body: string;
    memberId: Id<'members'>;
}

interface Channel {
    _id: Id<'channels'>;
    name: string;
}

interface MessagesByChannel {
    channel: Channel;
    messages: Message[];
}

export default function OutboxPage() {
    const workspaceId = useWorkspaceId();
    const messagesByChannel = useGetUserMessages();

    if (!messagesByChannel) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-white">
                <Loader className="size-12 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
        );
    }

    if (!messagesByChannel.length) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-y-2 bg-white">
                <Mail className="size-12 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Outbox</h2>
                <p className="text-sm text-muted-foreground">No messages sent yet.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col gap-y-4 bg-white p-4">
            <div className="flex items-center gap-x-2">
                <Mail className="size-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Outbox</h2>
            </div>

            <div className="flex flex-col gap-y-6">
                {messagesByChannel.map(({ channel, messages }: MessagesByChannel) => (
                    <div key={channel._id} className="flex flex-col gap-y-2">
                        <Link
                            href={`/workspace/${workspaceId}/channel/${channel._id}`}
                            className="text-sm font-medium text-muted-foreground hover:underline"
                        >
                            #{channel.name}
                        </Link>

                        <div className="flex flex-col gap-y-2">
                            {messages.map((message: Message) => (
                                <div
                                    key={message._id}
                                    className="flex flex-col gap-y-1 rounded-lg border bg-white p-3 shadow-sm"
                                >
                                    <p className="text-sm">{message.body}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(message._creationTime), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 