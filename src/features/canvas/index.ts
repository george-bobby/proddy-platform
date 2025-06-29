// Export components from the canvas folder
import { Canvas } from './components/canvas';
import { Toolbar } from './components/toolbar';
import { CanvasSidebar } from './components/canvas-sidebar';

// Export renamed components for canvas feature
export const CanvasHeader = () => null; // Replace with empty component
export const CanvasCanvas = Canvas;
export const CanvasToolbar = Toolbar;

// Export original components
export { Canvas, Toolbar, CanvasSidebar };
