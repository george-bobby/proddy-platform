// Re-export all chatbot functions from their new organized locations
export {
	getChatHistory,
	addMessage,
	clearChatHistory,
} from './chatbot/chat_history';
export { detectAssistantType } from './chatbot/message_processing';
export { generateResponse } from './assistant';
