import { Mic, MicOff, Users, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCallStateHooks, useCall, OwnCapability } from '@stream-io/video-react-sdk';
import { toast } from 'sonner';
import { ToolButton } from '@/features/canvas/components/tool-button';

interface AudioToolbarButtonProps {
  showParticipants: boolean;
  toggleParticipants: () => void;
}

export const AudioToolbarButton = ({
  showParticipants,
  toggleParticipants
}: AudioToolbarButtonProps) => {
  const call = useCall();
  const { useMicrophoneState, useHasPermissions } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const [micPermissionError, setMicPermissionError] = useState(false);
  const hasAudioPermission = useHasPermissions(OwnCapability.SEND_AUDIO);

  // Check browser microphone permissions on mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        // Check if the browser has microphone permission
        const devices = await navigator.mediaDevices.getUserMedia({ audio: true });
        // If we get here, permission is granted
        setMicPermissionError(false);
        // Release the media stream
        devices.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone permission error:', error);
        setMicPermissionError(true);
      }
    };

    checkMicrophonePermission();
  }, []);

  // Request audio permission if we don't have it
  useEffect(() => {
    if (call && !hasAudioPermission) {
      const requestAudioPermission = async () => {
        try {
          await call.requestPermissions({
            permissions: [OwnCapability.SEND_AUDIO],
          });
          console.log('Audio permission granted');
        } catch (error) {
          console.error('Failed to request audio permission:', error);
        }
      };

      requestAudioPermission();
    }
  }, [call, hasAudioPermission]);

  const toggleMicrophone = async () => {
    try {
      // First check if we have browser permission
      if (micPermissionError) {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        return;
      }

      // Then check if we have Stream permission
      if (!hasAudioPermission) {
        // Request permission first
        await call?.requestPermissions({
          permissions: [OwnCapability.SEND_AUDIO],
        });
      }

      // Toggle microphone
      if (isMute) {
        await microphone.enable();
        console.log('Microphone enabled');
        toast.success('Microphone enabled');
      } else {
        await microphone.disable();
        console.log('Microphone disabled');
        toast.success('Microphone disabled');
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      toast.error('Failed to toggle microphone');
      setMicPermissionError(true);
    }
  };

  return (
    <div className="flex flex-col gap-y-1">
      {micPermissionError ? (
        <ToolButton
          label="Mic Permission Denied"
          icon={AlertCircle}
          onClick={() => toast.error('Microphone access denied. Please allow microphone access in your browser settings.')}
          isActive={false}
        />
      ) : (
        <div className="relative">
          <ToolButton
            label={isMute ? 'Unmute to speak' : 'Mute microphone'}
            icon={isMute ? MicOff : Mic}
            onClick={toggleMicrophone}
            isActive={!isMute}
          />
          {isMute && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"
                 title="Microphone is muted. Click to unmute and speak." />
          )}
        </div>
      )}
      <ToolButton
        label="Participants"
        icon={Users}
        onClick={toggleParticipants}
        isActive={showParticipants}
      />
    </div>
  );
};
