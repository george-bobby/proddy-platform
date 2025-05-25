'use client';

import { ArrowLeft, Menu, Phone, Video, MoreHorizontal, Users, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { TestNavigation } from '@/app/test/components/test-navigation';

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[];
  unreadCount: number;
  isOnline?: boolean;
  avatar?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestChatsHeaderProps {
  selectedChat?: Chat | null;
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onShowDailyRecap: () => void;
}

export const TestChatsHeader = ({
  selectedChat,
  onToggleSidebar,
  sidebarCollapsed,
  onShowDailyRecap,
}: TestChatsHeaderProps) => {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/test/dashboard');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'channel':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation and chat info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Chats</h1>
            <Badge variant="secondary" className="text-xs">
              Demo
            </Badge>
          </div>

          {selectedChat && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {getInitials(selectedChat.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedChat.name}</span>
                    {getChatIcon(selectedChat.type)}
                    {selectedChat.type === 'direct' && selectedChat.isOnline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {selectedChat.type === 'direct' && selectedChat.isOnline && 'Online'}
                    {selectedChat.type === 'direct' && !selectedChat.isOnline && 'Offline'}
                    {selectedChat.type === 'group' && `${selectedChat.participants.length} members`}
                    {selectedChat.type === 'channel' && `${selectedChat.participants.length} subscribers`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Navigation and actions */}
        <div className="flex items-center gap-4">
          <TestNavigation variant="compact" />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowDailyRecap}
              className="text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-4 w-4 mr-2" />
              Daily Recap
            </Button>

            {selectedChat && (
              <>
                {selectedChat.type === 'direct' && (
                  <>
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Search Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Notification Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {selectedChat.type === 'group' && (
                      <DropdownMenuItem>
                        Manage Members
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      Export Chat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      {selectedChat.type === 'direct' ? 'Block User' : 'Leave Chat'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
