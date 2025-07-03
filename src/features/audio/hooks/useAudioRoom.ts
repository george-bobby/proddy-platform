import { useState, useEffect } from 'react';
import {
  StreamVideoClient,
  User,
  Call
} from '@stream-io/video-react-sdk';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

// Stream API credentials from environment variables
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';

interface UseAudioRoomProps {
  roomId: string;
  workspaceId: string;
  channelId: string;
  canvasName?: string;
}

export const useAudioRoom = ({ roomId, workspaceId, channelId, canvasName }: UseAudioRoomProps) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user from Convex
  const currentUser = useQuery(api.users.current);

  useEffect(() => {
    if (!currentUser || !roomId || !workspaceId || !channelId || !apiKey) return;

    const setupAudioRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        const userId = currentUser._id;

        // Create user object for Stream
        const user: User = {
          id: userId,
          name: currentUser.name || 'Anonymous',
          image: currentUser.image || `https://getstream.io/random_svg/?id=${userId}&name=${currentUser.name}`,
        };

        // Fetch token from our API
        console.log('Fetching Stream token for user:', userId);
        const response = await fetch('/api/stream-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            userName: currentUser.name,
            userImage: currentUser.image
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get Stream token: ${response.status}`);
        }

        const { token } = await response.json();
        console.log('Token received successfully');

        // Initialize Stream client
        const videoClient = new StreamVideoClient({
          apiKey,
          user,
          token,
        });

        console.log('Stream client initialized successfully');
        setClient(videoClient);

        // Create unique room ID (keeping it under 64 characters)
        const uniqueRoomId = `audio-${workspaceId.slice(-8)}-${channelId.slice(-8)}-${roomId.slice(-8)}`.substring(0, 63);
        console.log('Creating audio room with ID:', uniqueRoomId);

        // Create and join the call
        const audioCall = videoClient.call('audio_room', uniqueRoomId);

        await audioCall.join({
          create: true,
          data: {
            custom: {
              title: canvasName || 'Canvas Audio Room',
              description: 'Collaborate on canvas with audio',
              workspaceId,
              channelId,
              canvasId: roomId
            }
          },
        });

        console.log('Successfully joined audio room');
        setCall(audioCall);
        setIsConnecting(false);

      } catch (error: any) {
        console.error('Failed to setup audio room:', error);
        setError(error.message || 'Failed to connect to audio room');
        setIsConnecting(false);
      }
    };

    setupAudioRoom();

    // Cleanup on unmount
    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [currentUser, roomId, workspaceId, channelId, canvasName, apiKey]);

  return {
    client,
    call,
    currentUser,
    isConnecting,
    error
  };
};
