import { useState, useEffect } from 'react';
import {
	StreamVideoClient,
	User,
	OwnCapability,
} from '@stream-io/video-react-sdk';
import { useCurrentUser } from '@/features/auth/api/use-current-user';

// Stream API credentials from environment variables
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
// Make sure this environment variable is set in .env.local

interface UseAudioRoomProps {
	roomId: string;
	workspaceId: string;
	channelId: string;
	canvasName?: string;
}

export const useAudioRoom = ({
	roomId,
	workspaceId,
	channelId,
	canvasName,
}: UseAudioRoomProps) => {
	const [client, setClient] = useState<StreamVideoClient | null>(null);
	const [call, setCall] = useState<any>(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<any>(null);

	// Get current user from Convex using custom hook
	const { data: currentUser } = useCurrentUser();

	useEffect(() => {
		if (!currentUser || !roomId || !workspaceId || !channelId) return;

		// Create a unique room ID that includes workspace, channel, and canvas context
		// We need to keep it under 64 characters for Stream's API
		// Use a hash function to create a shorter but still unique ID
		const createShortHash = (str: string) => {
			let hash = 0;
			for (let i = 0; i < str.length; i++) {
				const char = str.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				hash = hash & hash; // Convert to 32bit integer
			}
			return Math.abs(hash).toString(36); // Convert to base36 (alphanumeric) to make it shorter
		};

		// Create a unique identifier by combining the IDs but keeping it short
		const contextId = `${workspaceId}-${channelId}-${roomId}`;
		const shortHash = createShortHash(contextId);
		const uniqueRoomId = `ws${workspaceId.slice(-4)}_ch${channelId.slice(-4)}_${shortHash}`;

		// Ensure the ID is under 64 characters
		const finalRoomId = uniqueRoomId.substring(0, 63);

		console.log(
			'Creating audio room with unique ID:',
			finalRoomId,
			'(length:',
			finalRoomId.length,
			')'
		);

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
						userImage: currentUser.image,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					console.error('Failed to get Stream token:', {
						status: response.status,
						statusText: response.statusText,
						errorData,
					});
					throw new Error(
						`Failed to get Stream token: ${response.status} ${response.statusText}`
					);
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
				const testToken =
					'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0VtcGVyb3JfUGFscGF0aW5lIiwidXNlcl9pZCI6IkVtcGVyb3JfUGFscGF0aW5lIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NDY1NDIzNzMsImV4cCI6MTc0NzE0NzE3M30.SfRNmwRFuQeS6E6SfhMedsE8LEAT2bSDLV0uUSen2xQ';
				const testUser = {
					id: 'Emperor_Palpatine',
					name: currentUser.name || 'Anonymous',
					image: currentUser.image,
				};

				console.log(
					'Trying with Stream example credentials to test connection'
				);

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
							logLevel: 'debug', // Enable detailed logging
						},
					});
				} catch (initError) {
					console.error(
						'First Stream client initialization attempt failed:',
						initError
					);

					// Second attempt: Try with a different user
					try {
						console.log('Attempt 2: Using alternative user configuration');
						const alternativeUser = {
							id: 'anonymous-user',
							name: 'Anonymous',
							type: 'guest' as const, // Explicitly set type to "guest"
						};

						videoClient = new StreamVideoClient({
							apiKey: testApiKey,
							user: alternativeUser,
							token: testToken,
							options: {
								logLevel: 'debug',
							},
						});
					} catch (secondError) {
						console.error(
							'Second Stream client initialization attempt failed:',
							secondError
						);
						throw new Error(
							'Failed to initialize Stream client after multiple attempts'
						);
					}
				}

				console.log('Stream client initialized successfully');
				setClient(videoClient);

				// Use our unique room ID that includes workspace, channel, and canvas context
				// This ensures audio rooms are properly isolated
				console.log('Creating audio room with ID:', finalRoomId);

				// Get the call object
				const audioCall = videoClient.call('audio_room', finalRoomId);

				try {
					// Join or create the call with audio permissions
					console.log('Joining audio room with audio permissions...');

					try {
						// Validate that the room ID is not too long for Stream's API
						if (finalRoomId.length > 64) {
							console.error('Room ID is too long:', finalRoomId.length);
							throw new Error('Room ID exceeds the 64 character limit');
						}

						await audioCall.join({
							create: true,
							data: {
								custom: {
									title: canvasName || 'Canvas Audio Room',
									description: 'Collaborate on canvas with audio',
									workspaceId: workspaceId,
									channelId: channelId,
									canvasId: roomId,
								},
							},
						});

						console.log('Successfully joined audio room');
					} catch (joinError: any) {
						console.error('Failed to join audio room:', joinError);

						// Check if the error is related to the room ID length
						if (
							joinError.message &&
							joinError.message.includes('maximum 64 characters')
						) {
							throw new Error(
								'Room ID is too long. Please try again with a shorter room ID.'
							);
						}

						// Try a simpler join without custom data
						console.log('Attempting simplified join...');
						try {
							await audioCall.join({ create: true });
							console.log(
								'Successfully joined audio room with simplified options'
							);
						} catch (simplifiedJoinError: any) {
							console.error(
								'Failed simplified join attempt:',
								simplifiedJoinError
							);
							throw simplifiedJoinError;
						}
					}

					// Set the call in state
					setCall(audioCall);

					// Request permission to send audio (but don't enable microphone)
					await audioCall.requestPermissions({
						permissions: [OwnCapability.SEND_AUDIO],
					});
				} catch (callError: any) {
					console.error('Failed to create or join call:', callError);
					throw new Error(
						`Failed to create or join call: ${callError.message || 'Unknown error'}`
					);
				}

				// Don't enable microphone automatically - let users unmute themselves
				console.log(
					'Microphone is muted by default - users can unmute when ready to speak'
				);

				setIsConnecting(false);
			} catch (error: any) {
				console.error('Failed to join audio room:', error);

				// Format the error for better debugging
				let formattedError = error;

				// Check for WebSocket connection issues
				if (
					error.isWSFailure ||
					(error.message && error.message.includes('WS connection')) ||
					(error.message &&
						error.message.includes('connection could not be established'))
				) {
					// Log detailed information about the error
					console.log('WebSocket connection error details:', {
						error,
						navigator: {
							onLine: navigator.onLine,
							userAgent: navigator.userAgent,
						},
						location: window.location.href,
					});

					formattedError = {
						...error,
						message:
							'WebSocket connection failed. This may be due to network issues, firewall settings, or browser restrictions.',
						details: {
							...error.details,
							suggestion:
								'Try the following:\n1. Check your internet connection\n2. Try a different network\n3. Disable any VPN or proxy\n4. Try a different browser\n5. Check firewall settings',
							originalMessage: error.message,
							isOnline: navigator.onLine,
						},
					};
				} else if (error.message && error.message.includes('token')) {
					formattedError = {
						...error,
						message:
							'Authentication failed. There might be an issue with your Stream API credentials.',
						details: {
							...error.details,
							suggestion:
								'Check your Stream API key and secret in the environment variables.',
							originalMessage: error.message,
						},
					};
				} else if (
					error.code === 43 ||
					(error.message && error.message.includes('signature is not valid'))
				) {
					formattedError = {
						...error,
						message:
							'JWT signature validation failed. The token might be invalid or using the wrong secret.',
						details: {
							...error.details,
							suggestion: 'Verify that the Stream API secret is correct.',
							originalMessage: error.message,
						},
					};
				}

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
	}, [currentUser, roomId, workspaceId, channelId, canvasName]);

	return {
		client,
		call,
		currentUser,
		isConnecting,
		error,
	};
};
