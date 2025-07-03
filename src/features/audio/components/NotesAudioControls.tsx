import { Mic, MicOff, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCallStateHooks, useCall, OwnCapability } from '@stream-io/video-react-sdk';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NotesAudioControlsProps {}

export const NotesAudioControls = ({}: NotesAudioControlsProps) => {
  const call = useCall();
  const { useMicrophoneState, useHasPermissions } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const [micPermissionError, setMicPermissionError] = useState(false);
  const hasAudioPermission = useHasPermissions(OwnCapability.SEND_AUDIO);

  // Speaker state (audio output)
  const [speakerMuted, setSpeakerMuted] = useState(false);

  // Check for microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermissionError(false);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setMicPermissionError(true);
      }
    };

    checkMicPermission();
  }, []);

  const toggleSpeaker = () => {
    setSpeakerMuted(!speakerMuted);
    
    // Get all audio elements and mute/unmute them
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = !speakerMuted;
    });

    if (!speakerMuted) {
      toast.success('Speaker muted');
    } else {
      toast.success('Speaker unmuted');
    }
  };

  const toggleMicrophone = async () => {
    try {
      // First check if we have browser permission
      if (micPermissionError) {
        console.error('Microphone access denied');
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
        toast.success('Microphone unmuted');
      } else {
        await microphone.disable();
        console.log('Microphone disabled');
        toast.success('Microphone muted');
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      setMicPermissionError(true);
      toast.error('Failed to toggle microphone');
    }
  };

  // Don't render if no call is available
  if (!call) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Speaker (audio output) control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleSpeaker}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative"
            >
              {speakerMuted ? (
                <VolumeX className="h-4 w-4 text-red-500" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              {speakerMuted && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {speakerMuted ? 'Unmute speaker' : 'Mute speaker'}
          </TooltipContent>
        </Tooltip>

        {/* Microphone control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={micPermissionError ? undefined : toggleMicrophone}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative"
              disabled={micPermissionError}
            >
              {micPermissionError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : isMute ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {(isMute || micPermissionError) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {micPermissionError 
              ? 'Microphone permission denied' 
              : isMute 
                ? 'Unmute to speak' 
                : 'Mute microphone'
            }
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
