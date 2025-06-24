// Components
export { CompactMessage } from './components/compact-message';
export { FullMessage } from './components/full-message';
export { MessageContent } from './components/message-content';
export { MessageContextMenu } from './components/message-context-menu';
export { TaskCreationModal } from './components/task-creation-modal';

// Contexts
export { ContextMenuProvider, useContextMenu } from './contexts/context-menu-context';

// Hooks
export { useMessageActions } from './hooks/use-message-actions';

// Types
export type { MessageProps, ContextMenuState, TaskModalState } from './types/message';

// Utils
export { formatFullTime, extractTextFromBody } from './utils/message-utils';

// Examples (for development/testing)
export { ContextMenuDemo } from './examples/context-menu-demo';
