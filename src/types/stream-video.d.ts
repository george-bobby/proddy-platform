declare module '@stream-io/video-react-sdk' {
  export interface User {
    id: string;
    name?: string;
    image?: string;
    type?: 'user' | 'guest';
  }

  export class StreamVideoClient {
    constructor(options: {
      apiKey: string;
      user: User;
      token: string;
      options?: {
        logLevel?: string;
      };
    });

    call(type: string, id: string): any;
    disconnectUser(): Promise<void>;
  }

  export enum OwnCapability {
    SEND_AUDIO = 'send-audio',
    SEND_VIDEO = 'send-video',
    SCREENSHARE = 'screenshare',
    JOIN_CALL = 'join-call',
    // Add other capabilities as needed
  }

  export namespace SfuModels {
    export enum TrackType {
      AUDIO = 'audio',
      VIDEO = 'video',
      SCREEN_SHARE = 'screen_share',
      SCREEN_SHARE_AUDIO = 'screen_share_audio',
    }
  }

  export interface StreamVideoParticipant {
    publishedTracks: string[];
    isSpeaking: boolean;
    audioLevel: number;
    // Add other properties as needed
  }

  export const StreamVideo: React.FC<{
    client: StreamVideoClient;
    children: React.ReactNode;
  }>;

  export const StreamCall: React.FC<{
    call: any;
    children: React.ReactNode;
  }>;

  export const ParticipantsAudio: React.FC<{
    participants: StreamVideoParticipant[];
  }>;

  export function useCallStateHooks(): {
    useParticipants: () => StreamVideoParticipant[];
    useCallState: () => any;
    useLocalParticipant: () => StreamVideoParticipant;
    useMicrophoneState: () => {
      microphone: {
        enable: () => Promise<void>;
        disable: () => Promise<void>;
      };
      isMute: boolean;
    };
    useSpeakerState: () => {
      speaker: {
        enable: () => Promise<void>;
        disable: () => Promise<void>;
      };
      isMute: boolean;
    };
    useHasPermissions: (permission: OwnCapability) => boolean;
  };

  export function useCall(): any;
}
