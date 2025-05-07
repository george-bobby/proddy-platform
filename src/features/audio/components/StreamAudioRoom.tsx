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
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAudioRoom } from '../'; // Import from index to get the new implementation
import { AudioToolbarButton } from './AudioToolbarButton';
import Image from 'next/image';

interface StreamAudioRoomProps {
  roomId: string;
  canvasName?: string;
}

export const StreamAudioRoom = ({ roomId, canvasName }: StreamAudioRoomProps) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [showFallbackUI, setShowFallbackUI] = useState(false);

  // Use our custom hook to manage the audio room
  const { client, call, currentUser, isConnecting, error } = useAudioRoom({
    roomId,
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
          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
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
            className="flex-1 bg-white hover:bg-gray-100 text-primary flex items-center justify-center"
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
            <AudioRoomUI
              showParticipants={showParticipants}
              toggleParticipants={() => setShowParticipants(!showParticipants)}
            />
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
  showParticipants: boolean;
  toggleParticipants: () => void;
}

const AudioRoomUI = ({ showParticipants, toggleParticipants }: AudioRoomUIProps) => {
  const { useParticipants, useCallState, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const callState = useCallState();
  const localParticipant = useLocalParticipant();

  // Check if audio is published
  const hasAudio = (p: StreamVideoParticipant) =>
    p.publishedTracks.includes(SfuModels.TrackType.AUDIO);

  // Check if participant is speaking
  const isSpeaking = (p: StreamVideoParticipant) => p.isSpeaking;

  // Separate speakers and listeners
  const speakers = participants.filter(p => hasAudio(p));
  const listeners = participants.filter(p => !hasAudio(p));

  // Log audio state for debugging
  useEffect(() => {
    if (localParticipant) {
      console.log('Local participant audio state:', {
        hasAudio: hasAudio(localParticipant),
        isSpeaking: isSpeaking(localParticipant),
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
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-md p-1.5 shadow-md">
        <AudioToolbarButton
          showParticipants={showParticipants}
          toggleParticipants={toggleParticipants}
        />

        {/* Debug button - only visible in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2">
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => {
                // Log audio state for debugging
                console.log('Debug audio state:', {
                  participants: participants.map(p => ({
                    id: p.userId,
                    name: p.name,
                    hasAudio: hasAudio(p),
                    isSpeaking: p.isSpeaking,
                    publishedTracks: p.publishedTracks,
                    audioLevel: p.audioLevel
                  })),
                  callState,
                  localParticipant: localParticipant ? {
                    id: localParticipant.userId,
                    hasAudio: hasAudio(localParticipant),
                    isSpeaking: localParticipant.isSpeaking,
                    publishedTracks: localParticipant.publishedTracks
                  } : null
                });

                // Check browser audio permissions
                navigator.mediaDevices.getUserMedia({ audio: true })
                  .then(stream => {
                    console.log('Browser audio permission granted');
                    // Check if we're getting audio levels
                    const audioContext = new AudioContext();
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(stream);
                    const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

                    analyser.smoothingTimeConstant = 0.8;
                    analyser.fftSize = 1024;

                    microphone.connect(analyser);
                    analyser.connect(javascriptNode);
                    javascriptNode.connect(audioContext.destination);

                    javascriptNode.onaudioprocess = function () {
                      const array = new Uint8Array(analyser.frequencyBinCount);
                      analyser.getByteFrequencyData(array);
                      const values = array.reduce((a, b) => a + b) / array.length;
                      console.log('Audio level:', values);

                      // Cleanup after a few seconds
                      setTimeout(() => {
                        javascriptNode.disconnect();
                        analyser.disconnect();
                        microphone.disconnect();
                        stream.getTracks().forEach(track => track.stop());
                      }, 3000);
                    };

                    toast.success('Audio debug started - check console');
                  })
                  .catch(err => {
                    console.error('Browser audio permission denied:', err);
                    toast.error('Browser audio permission denied');
                  });
              }}
            >
              Debug Audio
            </button>
          </div>
        )}
      </div>

      {/* Participants panel */}
      {showParticipants && (
        <div className="participants-panel fixed bottom-20 right-4 bg-white p-4 rounded-md shadow-md z-50 w-64 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Speakers ({speakers.length})</h4>
            <div className="text-xs text-gray-500">
              {callState.toString() === 'reconnecting' ? 'Reconnecting...' : 'Connected'}
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-2 italic">
            Click the microphone icon to unmute and speak
          </div>

          <div className="space-y-2 mb-4">
            {speakers.map(p => (
              <div key={p.sessionId} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${p.isSpeaking ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Image
                  src={p.image || `https://getstream.io/random_svg/?id=${p.userId}&name=${p.name}`}
                  alt={p.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{p.name}</span>
                {p.userId === localParticipant?.userId && (
                  <span className="text-xs text-gray-500 ml-auto">(you)</span>
                )}
              </div>
            ))}
            {speakers.length === 0 && (
              <div className="text-xs text-gray-500 italic">No active speakers</div>
            )}
          </div>

          <h4 className="font-medium mb-2">Listeners ({listeners.length})</h4>
          <div className="space-y-2">
            {listeners.map(p => (
              <div key={p.sessionId} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <Image
                  src={p.image || `https://getstream.io/random_svg/?id=${p.userId}&name=${p.name}`}
                  alt={p.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{p.name}</span>
                {p.userId === localParticipant?.userId && (
                  <span className="text-xs text-gray-500 ml-auto">(you)</span>
                )}
              </div>
            ))}
            {listeners.length === 0 && (
              <div className="text-xs text-gray-500 italic">No listeners</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
