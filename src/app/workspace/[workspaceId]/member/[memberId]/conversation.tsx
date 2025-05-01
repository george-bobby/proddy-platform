import { FaChevronDown } from 'react-icons/fa';
import { Loader } from 'lucide-react';

import type { Id } from '@/../convex/_generated/dataModel';
import { MessageList } from '@/components/message-list';
import { ChatInput } from '@/components/chat-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetMember } from '@/features/members/api/use-get-member';
import { useGetMessages } from '@/features/messages/api/use-get-messages';
import { useMemberId } from '@/hooks/use-member-id';
import { usePanel } from '@/hooks/use-panel';
import { WorkspaceHeader } from '../../workspace-toolbar';

interface ConversationProps {
  id: Id<'conversations'>;
}

export const Conversation = ({ id }: ConversationProps) => {
  const memberId = useMemberId();
  const { onOpenProfile } = usePanel();
  const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId });
  const { results, status, loadMore } = useGetMessages({ conversationId: id });

  if (memberLoading || status === 'LoadingFirstPage') {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const avatarFallback = member?.user.name?.charAt(0).toUpperCase() || 'M';

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader>
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
      </WorkspaceHeader>

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
        conversationId={id}
        memberName={member?.user.name}
      />
    </div>
  );
};
