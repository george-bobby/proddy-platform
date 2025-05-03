'use client';

import { AlertTriangle, Loader } from 'lucide-react';
import { FaChevronDown } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { Id } from '@/../convex/_generated/dataModel';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetMember } from '@/features/members/api/use-get-member';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { useCreateOrGetConversation } from '@/features/conversations/api/use-create-or-get-conversation';
import { useMemberId } from '@/hooks/use-member-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { usePanel } from '@/hooks/use-panel';
import { WorkspaceToolbar } from '../../toolbar';

const MemberIdPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const { onOpenProfile } = usePanel();

  const [conversationId, setConversationId] = useState<Id<'conversations'> | null>(null);

  const { mutate, isPending: conversationPending } = useCreateOrGetConversation();
  const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId });

  // Always call the hook with a valid parameter
  const { results, status, loadMore } = useGetMessages({
    conversationId: conversationId || undefined
  });

  // Define a loading state for when we don't have a conversation yet
  const isMessagesLoading = !conversationId || status === 'LoadingFirstPage';

  useEffect(() => {
    mutate(
      {
        workspaceId,
        memberId,
      },
      {
        onSuccess: (data) => setConversationId(data),
        onError: () => {
          toast.error('Failed to create or get conversation.');
        },
      }
    );
  }, [workspaceId, memberId, mutate]);

  if (conversationPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="h-full flex-col items-center justify-center gap-y-2">
        <AlertTriangle className="size-6 text-muted-foreground" />

        <span className="text-sm text-muted-foreground">Conversation not found.</span>
      </div>
    );
  }

  if (memberLoading || isMessagesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avatarFallback = member?.user.name?.charAt(0).toUpperCase() || 'M';

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
          onClick={() => onOpenProfile(memberId)}
        >
          <Avatar className="mr-3 size-7">
            <AvatarImage src={member?.user.image} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="truncate">{member?.user.name || 'Member'}</span>
          <FaChevronDown className="ml-2 size-2.5 transition-transform duration-200 group-hover:rotate-180" />
        </Button>
      </WorkspaceToolbar>

      <MessageList
        data={results}
        variant="conversation"
        memberName={member?.user.name}
        memberImage={member?.user.image}
        loadMore={loadMore}
        canLoadMore={status === 'CanLoadMore'}
        isLoadingMore={status === 'LoadingMore'}
      />

      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={conversationId}
        memberName={member?.user.name}
      />
    </div>
  );
};

export default MemberIdPage;
