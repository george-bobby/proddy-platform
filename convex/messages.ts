// Re-export all messaging functions from their new organized locations
export {
	get,
	_getMessageById,
	getById,
	populateThread,
	populateReactions,
	populateUser,
	populateMember,
	getMember,
} from './messaging/message_queries';

export { create, update, remove } from './messaging/message_mutations';

export {
	getUserMessages,
	getAllWorkspaceMessages,
	getMessageBodies,
	getRecentChannelMessages,
} from './messaging/message_search';

export { getThreadMessages } from './messaging/thread_management';

export {
	getMentionedMessages,
	createTestMentionMessage,
} from './messaging/mention_processing';
