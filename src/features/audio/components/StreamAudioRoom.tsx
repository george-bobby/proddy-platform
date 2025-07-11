import { useState, useEffect } from 'react';
import {
  StreamCall,
  StreamVideo,
  useCallStateHooks,
  ParticipantsAudio,
  SfuModels,
  StreamVideoParticipant
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { useAudioRoom } from '../'; // Import from index to get the new implementation
import { AudioToolbarButton } from './AudioToolbarButton';
import { AudioControlButton } from './AudioControlButton';

interface StreamAudioRoomProps {
  roomId: string;
  workspaceId: string;
  channelId: string;
  canvasName?: string;
  isFullScreen?: boolean;
}

export const StreamAudioRoom = ({ roomId, workspaceId, channelId, canvasName, isFullScreen }: StreamAudioRoomProps) => {
  const [retryKey, setRetryKey] = useState(0);
  const [showFallbackUI, setShowFallbackUI] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [isLeavingConfirmed, setIsLeavingConfirmed] = useState(false);

  // Use our custom hook to manage the audio room
  const {
    client,
    call,
    currentUser,
    isConnecting,
    isConnected,
    error,
    connectToAudioRoom,
    disconnectFromAudioRoom
  } = useAudioRoom({
    roomId,
    workspaceId,
    channelId,
    canvasName,
    shouldConnect
  });

  // Cleanup effect to handle disconnection when shouldConnect becomes false
  useEffect(() => {
    if (!shouldConnect && isConnected) {
      disconnectFromAudioRoom();
    }
  }, [shouldConnect, isConnected, disconnectFromAudioRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectFromAudioRoom();
      }
    };
  }, [isConnected, disconnectFromAudioRoom]);

  // Function to join audio room
  const handleJoinAudio = () => {
    setShouldConnect(true);
  };

  // Function to show leave confirmation
  const handleLeaveAudio = () => {
    setShowLeaveConfirmation(true);
  };

  // Function to actually leave audio room after confirmation
  const confirmLeaveAudio = async () => {
    if (isLeavingConfirmed) return;

    try {
      setIsLeavingConfirmed(true);

      // First set shouldConnect to false to prevent reconnection
      setShouldConnect(false);

      // Then disconnect from the audio room
      await disconnectFromAudioRoom();

      // Hide confirmation dialog
      setShowLeaveConfirmation(false);
    } catch (error) {
      console.error('Error leaving audio room:', error);
      // Still set shouldConnect to false even if there's an error
      setShouldConnect(false);
      setShowLeaveConfirmation(false);
    } finally {
      setIsLeavingConfirmed(false);
    }
  };

  // Function to cancel leave confirmation
  const cancelLeaveAudio = () => {
    if (!isLeavingConfirmed) {
      setShowLeaveConfirmation(false);
    }
  };

  // Handle keyboard events for confirmation dialog
  useEffect(() => {
    if (!showLeaveConfirmation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelLeaveAudio();
      } else if (event.key === 'Enter') {
        confirmLeaveAudio();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLeaveConfirmation, isLeavingConfirmed]);

  // Function to force a retry by changing the key
  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
    window.location.reload();
  };

  // Function to show fallback UI instead of retrying
  const handleShowFallback = () => {
    setShowFallbackUI(true);
  };

  if (isConnecting) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-100 flex items-center gap-2"
          disabled
        >
          <div className="animate-spin h-3 w-3 border-2 border-secondary border-t-transparent rounded-full" />
          Connecting to audio...
        </Button>
      </div>
    );
  }

  // If user chose to use fallback UI, show a simple button to enable audio
  if (showFallbackUI) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-100 flex items-center gap-2"
          onClick={() => setShowFallbackUI(false)}
        >
          Enable Audio
        </Button>
      </div>
    );
  }

  if (error) {
    // Check if this is a WebSocket connection issue
    const isWSError = typeof error === 'string' && error.includes('WS connection');

    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white p-3 rounded-md shadow-md max-w-xs">
        <h4 className="text-sm font-medium text-red-500 mb-1">
          {isWSError ? 'Network Connection Failed' : 'Audio Connection Failed'}
        </h4>
        <p className="text-xs text-gray-600 mb-2">
          {error}
        </p>

        {isWSError && (
          <p className="text-xs text-gray-600 mb-2">
            This may be due to network issues or firewall settings. Try using a different network or check your firewall settings.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white hover:bg-gray-100 text-secondary flex items-center justify-center"
            onClick={handleRetry}
          >
            Retry
          </Button>

          {isWSError && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-gray-100 text-gray-600 flex items-center justify-center"
              onClick={handleShowFallback}
            >
              Continue Without Audio
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {isWSError
            ? 'Audio rooms require a stable network connection.'
            : 'Each canvas has its own audio room for collaboration.'}
        </div>
      </div>
    );
  }

  // Show join button if not connected and not connecting
  if (!isConnected && !isConnecting && !shouldConnect) {
    return (
      <div className={`fixed ${isFullScreen ? 'bottom-8 right-8' : 'bottom-4 right-4'} z-50`}>
        <AudioControlButton
          icon={Phone}
          label="Join Audio Room"
          onClick={handleJoinAudio}
          variant="action"
          className="bg-green-600 hover:bg-green-700 text-white border-green-600"
        />
      </div>
    );
  }

  // Show audio room UI when connected
  return (
    <>
      {client && call && currentUser && isConnected ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <AudioRoomUI isFullScreen={isFullScreen} onLeaveAudio={handleLeaveAudio} />
          </StreamCall>
        </StreamVideo>
      ) : (
        // Render an empty div when not ready
        <div className="hidden"></div>
      )}

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Leave Audio Room?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to leave the audio room? You can rejoin at any time.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelLeaveAudio}
                disabled={isLeavingConfirmed}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmLeaveAudio}
                disabled={isLeavingConfirmed}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
              >
                {isLeavingConfirmed && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isLeavingConfirmed ? 'Leaving...' : 'Leave'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface AudioRoomUIProps {
  isFullScreen?: boolean;
  onLeaveAudio?: () => void;
}

const AudioRoomUI = ({ isFullScreen, onLeaveAudio }: AudioRoomUIProps) => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [isLeaving, setIsLeaving] = useState(false);

  // Check if audio is published
  const hasAudio = (p: StreamVideoParticipant) =>
    p.publishedTracks.includes(SfuModels.TrackType.AUDIO);

  // Handle leave audio with confirmation
  const handleLeaveWithConfirmation = () => {
    if (!onLeaveAudio || isLeaving) return;
    onLeaveAudio();
  };

  return (
    <div className="audio-room-ui">
      {/* Audio elements for all participants */}
      <ParticipantsAudio participants={participants} />

      {/* Audio controls container */}
      <div className={`fixed ${isFullScreen ? 'bottom-8 right-8' : 'bottom-4 right-4'} z-50`}>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
          {/* Main audio controls */}
          <div className="flex items-center justify-center mb-3">
            <AudioToolbarButton />
          </div>

          {/* Leave audio button */}
          {onLeaveAudio && (
            <div className="flex justify-center">
              <AudioControlButton
                icon={PhoneOff}
                label="Leave Audio"
                onClick={handleLeaveWithConfirmation}
                variant="action"
                className="bg-red-500 hover:bg-red-600 text-white border-red-500 text-xs px-3 py-1.5"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
