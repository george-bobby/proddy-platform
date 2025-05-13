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
import { useAudioRoom } from '../'; // Import from index to get the new implementation
import { AudioToolbarButton } from './AudioToolbarButton';

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

  // Use our custom hook to manage the audio room
  const { client, call, currentUser, isConnecting, error } = useAudioRoom({
    roomId,
    workspaceId,
    channelId,
    canvasName
  });

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
    console.error('Audio room error:', error);

    // Check if this is a WebSocket connection issue
    const isWSError = error.isWSFailure ||
      (error.message && typeof error.message === 'string' && error.message.includes('WS connection'));

    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white p-3 rounded-md shadow-md max-w-xs">
        <h4 className="text-sm font-medium text-red-500 mb-1">
          {isWSError ? 'Network Connection Failed' : 'Audio Connection Failed'}
        </h4>
        <p className="text-xs text-gray-600 mb-2">
          {typeof error === 'string'
            ? error
            : (error.message || 'Unknown error')}
        </p>

        {isWSError && (
          <p className="text-xs text-gray-600 mb-2">
            This may be due to network issues or firewall settings. Try using a different network or check your firewall settings.
          </p>
        )}

        {error && typeof error === 'object' && (
          <>
            {error.code && (
              <p className="text-xs text-gray-500 mb-1">
                Error code: {error.code}
              </p>
            )}
            {error.details && Object.keys(error.details).length > 0 && (
              <div className="text-xs text-gray-500 mb-2 max-h-20 overflow-y-auto">
                <p className="font-medium">Details:</p>
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </div>
            )}
          </>
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

  // Always render something, even if client/call/currentUser are not available
  return (
    <>
      {client && call && currentUser ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <AudioRoomUI isFullScreen={isFullScreen} />
          </StreamCall>
        </StreamVideo>
      ) : (
        // Render an empty div when not ready instead of returning null
        <div className="hidden"></div>
      )}
    </>
  );
};

interface AudioRoomUIProps {
  isFullScreen?: boolean;
}

const AudioRoomUI = ({ isFullScreen }: AudioRoomUIProps) => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Check if audio is published - kept for debugging purposes
  const hasAudio = (p: StreamVideoParticipant) =>
    p.publishedTracks.includes(SfuModels.TrackType.AUDIO);

  // Log audio state for debugging
  useEffect(() => {
    if (localParticipant) {
      console.log('Local participant audio state:', {
        hasAudio: hasAudio(localParticipant),
        isSpeaking: localParticipant.isSpeaking,
        publishedTracks: localParticipant.publishedTracks,
        audioLevel: localParticipant.audioLevel
      });
    }
  }, [localParticipant]);

  return (
    <div className="audio-room-ui">
      {/* Audio elements for all participants */}
      <ParticipantsAudio participants={participants} />

      {/* Audio controls */}
      <div className={`fixed ${isFullScreen ? 'bottom-8 right-8' : 'bottom-4 right-4'} z-50 bg-white rounded-md p-3 shadow-md`}>
        <AudioToolbarButton />
      </div>
    </div>
  );
};
