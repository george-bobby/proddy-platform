// Export components from the canvas folder
import { Canvas } from './_components/canvas';
import { Participants } from './_components/participants';
import { Toolbar } from './_components/toolbar';
import { Room } from '@/components/room';

// Export renamed components for canvas feature
export const CanvasHeader = () => null; // Replace with empty component
export const CanvasCanvas = Canvas;
export const CanvasToolbar = Toolbar;
export const CanvasActiveUsers = Participants;
export const CanvasLiveblocksProvider = Room;

// Export original components
export { Canvas, Participants, Toolbar, Room };
