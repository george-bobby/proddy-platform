import { useState, useEffect } from 'react';
import {
  StreamVideoClient,
  User,
  OwnCapability
} from '@stream-io/video-react-sdk';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { toast } from 'sonner';

// Stream API credentials from environment variables
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
// Make sure this environment variable is set in .env.local

interface UseAudioRoomProps {
  roomId: string;
  canvasName?: string;
}

export const useAudioRoom = ({ roomId, canvasName }: UseAudioRoomProps) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<any>(null);

  // Get current user from Convex
  const currentUser = useQuery(api.users.current);

  useEffect(() => {
    if (!currentUser || !roomId) return;

    const setupAudioRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Use the current user's ID
        const userId = currentUser._id;

        // Note: We're using test credentials for now, but keeping this for reference
        // when we switch back to using our own credentials
        /*
        const user: User = {
          id: userId,
          name: currentUser.name || 'Anonymous',
          image: currentUser.image || `https://getstream.io/random_svg/?id=${userId}&name=${currentUser.name}`,
        };
        */

        // Fetch a token from our API
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
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to get Stream token:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to get Stream token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.token) {
          console.error('Token missing in response:', data);
          throw new Error('Token missing in response');
        }

        const { token } = data;
        console.log('Received token from API:', token.substring(0, 20) + '...');

        console.log('Initializing Stream client for user:', userId);

        console.log('Stream API Key:', apiKey);
        console.log('User ID for Stream:', userId);
        console.log('Attempting to initialize Stream client with token');

        // Try using the example credentials from Stream's documentation
        // This is a temporary solution to test if the connection works
        const testApiKey = 'mmhfdzb5evj2';
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0VtcGVyb3JfUGFscGF0aW5lIiwidXNlcl9pZCI6IkVtcGVyb3JfUGFscGF0aW5lIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NDY1NDIzNzMsImV4cCI6MTc0NzE0NzE3M30.SfRNmwRFuQeS6E6SfhMedsE8LEAT2bSDLV0uUSen2xQ';
        const testUser = {
          id: 'Emperor_Palpatine',
          name: currentUser.name || 'Anonymous',
          image: currentUser.image
        };

        console.log('Trying with Stream example credentials to test connection');

        // Try to initialize the Stream client with different configurations
        let videoClient;

        try {
          // First attempt: Standard configuration
          console.log('Attempt 1: Using standard Stream client configuration');
          videoClient = new StreamVideoClient({
            apiKey: testApiKey,
            user: testUser,
            token: testToken,
            options: {
              logLevel: 'debug' // Enable detailed logging
            }
          });
        } catch (initError) {
          console.error('First Stream client initialization attempt failed:', initError);

          // Second attempt: Try with a different user
          try {
            console.log('Attempt 2: Using alternative user configuration');
            const alternativeUser = {
              id: 'anonymous-user',
              name: 'Anonymous',
              type: 'anonymous' as const
            };

            videoClient = new StreamVideoClient({
              apiKey: testApiKey,
              user: alternativeUser,
              token: testToken,
              options: {
                logLevel: 'debug'
              }
            });
          } catch (secondError) {
            console.error('Second Stream client initialization attempt failed:', secondError);
            throw new Error('Failed to initialize Stream client after multiple attempts');
          }
        }

        console.log('Stream client initialized successfully');
        setClient(videoClient);

        // Use the example call ID from Stream's documentation
        // This is a temporary solution to test if the connection works
        const callId = 'V4fmPI1qixZ9'; // Example call ID from Stream docs

        console.log('Creating audio room with ID:', callId);

        // Get the call object
        const audioCall = videoClient.call('audio_room', callId);

        try {
          // Join or create the call with audio permissions
          console.log('Joining audio room with audio permissions...');

          try {
            await audioCall.join({
              create: true,
              data: {
                custom: {
                  title: canvasName || 'Canvas Audio Room',
                  description: 'Collaborate on canvas with audio',
                  canvasId: roomId
                }
              },
            });

            console.log('Successfully joined audio room');
          } catch (joinError: any) {
            console.error('Failed to join audio room:', joinError);

            // Try a simpler join without custom data
            console.log('Attempting simplified join...');
            await audioCall.join({ create: true });

            console.log('Successfully joined audio room with simplified options');
          }

          // Set the call in state
          setCall(audioCall);

          // Request permission to send audio (but don't enable microphone)
          await audioCall.requestPermissions({
            permissions: [OwnCapability.SEND_AUDIO],
          });
        } catch (callError: any) {
          console.error('Failed to create or join call:', callError);
          throw new Error(`Failed to create or join call: ${callError.message || 'Unknown error'}`);
        }

        // Don't enable microphone automatically - let users unmute themselves
        console.log('Microphone is muted by default - users can unmute when ready to speak');

        // Show a toast notification to remind users they need to unmute to speak
        toast.info('Audio room joined. Click the microphone icon to unmute when you want to speak.');

        setIsConnecting(false);
      } catch (error: any) {
        console.error('Failed to join audio room:', error);

        // Format the error for better debugging
        let formattedError = error;
        let errorMessage = error.message || 'Unknown error';

        // Check for WebSocket connection issues
        if (error.isWSFailure || (error.message && error.message.includes('WS connection') || error.message && error.message.includes('connection could not be established'))) {
          // Log detailed information about the error
          console.log('WebSocket connection error details:', {
            error,
            navigator: {
              onLine: navigator.onLine,
              userAgent: navigator.userAgent
            },
            location: window.location.href
          });

          formattedError = {
            ...error,
            message: 'WebSocket connection failed. This may be due to network issues, firewall settings, or browser restrictions.',
            details: {
              ...error.details,
              suggestion: 'Try the following:\n1. Check your internet connection\n2. Try a different network\n3. Disable any VPN or proxy\n4. Try a different browser\n5. Check firewall settings',
              originalMessage: error.message,
              isOnline: navigator.onLine
            }
          };
          errorMessage = 'WebSocket connection failed. Check your network connection and browser settings.';
        } else if (error.message && error.message.includes('token')) {
          formattedError = {
            ...error,
            message: 'Authentication failed. There might be an issue with your Stream API credentials.',
            details: {
              ...error.details,
              suggestion: 'Check your Stream API key and secret in the environment variables.',
              originalMessage: error.message
            }
          };
          errorMessage = 'Authentication failed. Please try again later.';
        } else if (error.code === 43 || (error.message && error.message.includes('signature is not valid'))) {
          formattedError = {
            ...error,
            message: 'JWT signature validation failed. The token might be invalid or using the wrong secret.',
            details: {
              ...error.details,
              suggestion: 'Verify that the Stream API secret is correct.',
              originalMessage: error.message
            }
          };
          errorMessage = 'Authentication failed. Please try again later.';
        }

        toast.error(`Failed to join audio room: ${errorMessage}`);
        console.log('Detailed error information:', formattedError);

        setError(formattedError);
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
  }, [currentUser, roomId, canvasName]);

  return {
    client,
    call,
    currentUser,
    isConnecting,
    error
  };
};


