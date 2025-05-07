# Canvas Audio Room Feature

This feature adds real-time audio communication to the canvas pages in Proddy, allowing users to talk while collaborating on the canvas.

## Features

- Automatic audio room creation when entering a canvas
- Microphone mute/unmute controls
- Participant list with speaking indicators
- Integration with the canvas collaboration experience

## Implementation Details

### Components

- `StreamAudioRoom`: Main component that initializes and manages the audio room
- `AudioToolbarButton`: UI component for audio controls in the canvas toolbar
- `useAudioRoom`: Custom hook for managing audio room state

### Dependencies

- Stream Video & Audio SDK: `@stream-io/video-react-sdk`

### Configuration

The audio room feature uses Stream's Audio Room SDK with the following credentials:
- API Key: `wkypgt95byxg2kevk6e4a5a5mzb7vmg56wrdw5zs3vjvwfzrx27vaxatmvbjyeqx`
- App ID: `1384762`

## Usage

The audio room is automatically created and joined when a user enters a canvas page. Each canvas has its own unique audio room based on the canvas room ID.

### User Controls

- **Mute/Unmute**: Toggle your microphone on/off
- **Participants**: View a list of all participants in the audio room
- **Speaking Indicators**: Green indicators show which participants are currently speaking

## Security Considerations

- Token generation should be handled server-side in production
- The current implementation uses a placeholder token for demonstration purposes
- In a production environment, implement proper token generation with user authentication

## Future Improvements

- Add noise cancellation
- Implement permission requests for speaking
- Add audio quality settings
- Support for moderator controls
- Add visual speaking indicators on user avatars in the canvas
