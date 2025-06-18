import { action, mutation, query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

// Helper function to detect assistant type based on message content
function detectAssistantType(message: string): string {
	// GitHub-related queries
	if (
		/\b(github|create github issue|bug report|feature request|repository|repo|pull request|pr|commit|branch)\b/i.test(
			message
		)
	) {
		return 'github';
	}

	// Gmail/Email-related queries
	if (
		/\b(gmail|email|send email|inbox|draft|compose|mail|message)\b/i.test(
			message
		)
	) {
		return 'gmail';
	}

	// Slack-related queries
	if (
		/\b(slack|send slack message|slack channel|direct message|dm|workspace|team chat|notification)\b/i.test(
			message
		)
	) {
		return 'slack';
	}

	// Jira-related queries
	if (
		/\b(jira|create jira ticket|jira issue|ticket|story|epic|sprint|backlog|bug|subtask)\b/i.test(
			message
		)
	) {
		return 'jira';
	}

	// ClickUp-related queries
	if (
		/\b(clickup|click up|create clickup task|clickup project|space|folder|list|status|priority)\b/i.test(
			message
		)
	) {
		return 'clickup';
	}

	// Notion-related queries
	if (
		/\b(notion|create notion page|notion database|page|block|property|template|workspace)\b/i.test(
			message
		)
	) {
		return 'notion';
	}

	// Calendar/meeting-related queries
	if (
		/\b(meeting|meetings|event|events|calendar|schedule|appointment|appointments|today['']s events)\b/i.test(
			message
		)
	) {
		return 'calendar';
	}

	// Notes-related queries
	if (
		/\b(note|notes|document|documentation|write|create note|find note)\b/i.test(
			message
		)
	) {
		return 'notes';
	}

	// Tasks-related queries
	if (/\b(task|tasks|todo|assignment|deadline|project)\b/i.test(message)) {
		return 'tasks';
	}

	// Board/cards-related queries
	if (/\b(board|card|cards|kanban|list|column)\b/i.test(message)) {
		return 'board';
	}

	// Default to general chatbot
	return 'chatbot';
}

// Define types for chat messages and responses
type Source = {
	id: string;
	type: string;
	text: string;
};

type ChatMessage = {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	sources?: Source[];
	actions?: NavigationAction[];
};

type ChatHistory = {
	messages: ChatMessage[];
};

type NavigationAction = {
	label: string;
	type: string;
	url: string;
	noteId?: string;
	channelId?: string;
};

type GenerateResponseResult = {
	response: string;
	sources?: Array<{
		id: Id<any>;
		type: string;
		text: string;
	}>;
	actions?: NavigationAction[];
	error?: string;
};

// Get the current member for a workspace
async function getCurrentMember(ctx: QueryCtx, workspaceId: Id<'workspaces'>) {
	const userId = await getAuthUserId(ctx);
	if (!userId) throw new Error('Unauthorized');

	const member = await ctx.db
		.query('members')
		.withIndex('by_workspace_id_user_id', (q) =>
			q.eq('workspaceId', workspaceId).eq('userId', userId)
		)
		.unique();

	if (!member) throw new Error('Not a member of this workspace');
	return member;
}

// Get chat history for the current user in a workspace
export const getChatHistory = query({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args): Promise<ChatHistory> => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const chatHistory = await ctx.db
			.query('chatHistory')
			.withIndex('by_workspace_id_member_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
			)
			.first();

		if (!chatHistory) {
			// Return empty history if none exists
			return {
				messages: [],
			};
		}

		return {
			messages: chatHistory.messages,
		};
	},
});

// Add a message to chat history
export const addMessage = mutation({
	args: {
		workspaceId: v.id('workspaces'),
		content: v.string(),
		role: v.union(v.literal('user'), v.literal('assistant')),
		sources: v.optional(
			v.array(
				v.object({
					id: v.string(),
					type: v.string(),
					text: v.string(),
				})
			)
		),
		actions: v.optional(
			v.array(
				v.object({
					label: v.string(),
					type: v.string(),
					url: v.string(),
					noteId: v.optional(v.string()),
					channelId: v.optional(v.string()),
				})
			)
		),
	},
	handler: async (ctx, args) => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const chatHistory = await ctx.db
			.query('chatHistory')
			.withIndex('by_workspace_id_member_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
			)
			.first();

		const timestamp = Date.now();
		const newMessage: ChatMessage = {
			role: args.role,
			content: args.content,
			timestamp,
			sources: args.sources,
			actions: args.actions,
		};

		if (chatHistory) {
			// Update existing chat history
			return await ctx.db.patch(chatHistory._id, {
				messages: [...chatHistory.messages, newMessage],
				updatedAt: timestamp,
			});
		} else {
			// Create new chat history
			return await ctx.db.insert('chatHistory', {
				workspaceId: args.workspaceId,
				memberId: member._id,
				messages: [newMessage],
				updatedAt: timestamp,
			});
		}
	},
});

// Clear chat history
export const clearChatHistory = mutation({
	args: {
		workspaceId: v.id('workspaces'),
	},
	handler: async (ctx, args) => {
		const member = await getCurrentMember(ctx, args.workspaceId);

		const chatHistory = await ctx.db
			.query('chatHistory')
			.withIndex('by_workspace_id_member_id', (q) =>
				q.eq('workspaceId', args.workspaceId).eq('memberId', member._id)
			)
			.first();

		if (chatHistory) {
			// Reset to just the welcome message
			const timestamp = Date.now();
			return await ctx.db.patch(chatHistory._id, {
				messages: [
					{
						role: 'assistant',
						content:
							"Hello! I'm your workspace assistant. How can I help you today?",
						timestamp,
					},
				],
				updatedAt: timestamp,
			});
		}

		// If no history exists, do nothing
		return null;
	},
});

// Generate a response using RAG and external tools (GitHub via Composio)
export const generateResponse = action({
	args: {
		workspaceId: v.id('workspaces'),
		message: v.string(),
	},
	handler: async (ctx, args): Promise<GenerateResponseResult> => {
		try {
			// 1. Add user message to history first
			await ctx.runMutation(api.chatbot.addMessage, {
				workspaceId: args.workspaceId,
				content: args.message,
				role: 'user',
			});

			// 2. Detect assistant type based on query content
			const assistantType = detectAssistantType(args.message);

			console.log('[Chatbot] Message:', args.message);
			console.log('[Chatbot] Detected assistant type:', assistantType);

			// If it's a specialized assistant query, route to assistant API
			if (assistantType !== 'chatbot') {
				console.log(`[Chatbot] Routing to ${assistantType} assistant`);

				// Get workspace context for assistant integration
				const workspace = await ctx.runQuery(api.workspaces.getById, {
					id: args.workspaceId,
				});

				// Search for relevant workspace content to provide context
				const searchResults = await ctx.runQuery(api.search.searchAll, {
					workspaceId: args.workspaceId,
					query: args.message,
					limit: 5,
				});

				// Prepare workspace context
				const workspaceContext = `
Workspace: ${workspace?.name || 'Proddy'}
Recent relevant content:
${searchResults.map((result) => `[${result.type.toUpperCase()}] ${result.text.substring(0, 200)}`).join('\n')}
				`.trim();

				// Call Assistant API
				const baseUrl = process.env.DEPLOY_URL;
				const assistantApiUrl = `${baseUrl}/api/assistant`;

				try {
					const assistantResponse = await fetch(assistantApiUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							type: assistantType,
							message: args.message,
							workspaceContext,
							workspaceId: args.workspaceId,
						}),
					});

					if (!assistantResponse.ok) {
						throw new Error(`Assistant API error: ${assistantResponse.status}`);
					}

					const assistantData = await assistantResponse.json();

					if (assistantData.success) {
						// Add assistant response to history
						await ctx.runMutation(api.chatbot.addMessage, {
							workspaceId: args.workspaceId,
							content: assistantData.response,
							role: 'assistant',
							actions: assistantData.actions,
						});

						return {
							response: assistantData.response,
							sources: assistantData.sources || [],
							actions: assistantData.actions,
						};
					} else {
						throw new Error(
							assistantData.error || 'Assistant API returned an error'
						);
					}
				} catch (assistantError) {
					console.error('[Chatbot] Assistant API error:', assistantError);
					// Fall back to regular RAG response
					console.log('[Chatbot] Falling back to regular RAG response');
				}
			}

			// 3. Search for relevant content
			// Check if the query is about meetings or events
			const isMeetingQuery =
				/\b(meeting|meetings|event|events|calendar|schedule|appointment|appointments|today['']s events)\b/i.test(
					args.message
				);

			// Get today's date for meeting queries
			const today = new Date();
			const currentMonth = today.getMonth();
			const currentYear = today.getFullYear();

			// If asking about meetings, prioritize calendar events
			let searchResults;
			if (isMeetingQuery) {
				console.log(
					'[Chatbot] Detected meeting-related query, fetching calendar events'
				);

				// Get calendar events for the current month
				try {
					const calendarEvents = await ctx.runQuery(
						api.calendar.getCalendarEvents,
						{
							workspaceId: args.workspaceId,
							month: currentMonth,
							year: currentYear,
						}
					);

					// If we have calendar events, format them for the chatbot
					if (calendarEvents && calendarEvents.length > 0) {
						// Filter for today's events if the query specifically asks about today
						const isTodayQuery = /\b(today|today['']s)\b/i.test(args.message);

						let relevantEvents = calendarEvents;
						if (isTodayQuery) {
							const startOfToday = new Date(
								today.getFullYear(),
								today.getMonth(),
								today.getDate()
							).getTime();
							const endOfToday = new Date(
								today.getFullYear(),
								today.getMonth(),
								today.getDate(),
								23,
								59,
								59
							).getTime();

							relevantEvents = calendarEvents.filter(
								(event) =>
									event.date >= startOfToday && event.date <= endOfToday
							);
						}

						// Format events as search results
						searchResults = relevantEvents.map((event) => {
							const eventDate = new Date(event.date);

							// Extract additional details based on event type
							let additionalDetails = '';
							let locationInfo = '';

							// Type guard to check if event has message property
							const hasMessage = (
								e: any
							): e is {
								message: { body: any; channelId?: any; channelName?: string };
							} => {
								return e && typeof e.message === 'object' && e.message !== null;
							};

							// Extract message details if available
							if (hasMessage(event) && event.message.body) {
								try {
									// Try to extract text from rich text if available
									const bodyContent =
										typeof event.message.body === 'string'
											? event.message.body
											: JSON.stringify(event.message.body);

									// Check if it's JSON and try to extract plain text
									if (
										bodyContent.startsWith('{') &&
										bodyContent.includes('"ops"')
									) {
										const jsonBody = JSON.parse(bodyContent);
										if (jsonBody.ops && Array.isArray(jsonBody.ops)) {
											const textContent = jsonBody.ops
												.map((op: any) => op.insert || '')
												.join('')
												.trim();
											additionalDetails = ` | Description: ${textContent.substring(0, 100)}`;
										}
									}
								} catch (e) {
									// Ignore parsing errors
								}

								// Get channel information if available
								if (event.message.channelId) {
									locationInfo = ` | Channel: ${event.message.channelName || 'Unknown channel'}`;
								}
							}

							// Check for task details
							const hasTask = (
								e: any
							): e is { task: { title: string; description?: string } } => {
								return e && typeof e.task === 'object' && e.task !== null;
							};

							if (hasTask(event) && event.task) {
								if (event.task.description) {
									additionalDetails = ` | Description: ${event.task.description.substring(0, 100)}`;
								}
							}

							// Check for board card details
							const hasBoardCard = (
								e: any
							): e is {
								boardCard: {
									title: string;
									description?: string;
									listTitle?: string;
									channelName?: string;
								};
							} => {
								return (
									e && typeof e.boardCard === 'object' && e.boardCard !== null
								);
							};

							if (hasBoardCard(event) && event.boardCard) {
								if (event.boardCard.description) {
									additionalDetails = ` | Description: ${event.boardCard.description.substring(0, 100)}`;
								}
								if (event.boardCard.listTitle || event.boardCard.channelName) {
									locationInfo =
										` | Location: ${event.boardCard.listTitle || ''} ${event.boardCard.channelName || ''}`.trim();
								}
							}

							// Enhanced formatting for better AI parsing and display
							const eventTitle = event.title || 'Untitled event';
							const sourceType =
								event.type === 'calendar-event'
									? 'Calendar Event'
									: event.type === 'board-card'
										? 'Board Card'
										: event.type === 'task'
											? 'Task'
											: event.type || 'Event';

							// Convert to 12-hour format for better readability
							const eventTime = event.time || 'No specific time';
							let formattedTimeDisplay = eventTime;
							if (eventTime !== 'No specific time') {
								try {
									// Try to parse and format time to 12-hour format
									const [hours, minutes] = eventTime.split(':');
									const hour24 = parseInt(hours);
									const hour12 =
										hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
									const ampm = hour24 >= 12 ? 'PM' : 'AM';
									formattedTimeDisplay = `${hour12}:${minutes} ${ampm}`;
								} catch (e) {
									// Keep original format if parsing fails
									formattedTimeDisplay = eventTime;
								}
							}

							// Get day of week for better context
							const dayOfWeek = eventDate.toLocaleDateString('en-US', {
								weekday: 'long',
							});
							const shortDate = eventDate.toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							});

							// Clean up additional details
							const cleanDetails = additionalDetails.replace(
								' | Description: ',
								''
							);
							const cleanLocation = locationInfo
								.replace(' | Channel: ', '')
								.replace(' | Location: ', '');

							return {
								_id: event._id,
								_creationTime: event._creationTime,
								type: event.type || 'event',
								text: `MEETING: ${eventTitle}
DAY: ${dayOfWeek}
DATE: ${shortDate}
TIME: ${formattedTimeDisplay}
SOURCE: ${sourceType}${
									cleanLocation
										? `
LOCATION: ${cleanLocation}`
										: ''
								}${
									cleanDetails
										? `
DETAILS: ${cleanDetails}`
										: ''
								}`,
								workspaceId: args.workspaceId,
							};
						});

						// If no events found for today but it was a today query, add a message
						if (isTodayQuery && relevantEvents.length === 0) {
							// Create a special "no meetings today" result with better formatting
							const todayFormatted = new Date().toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							});

							searchResults = [
								{
									_id: 'no-meetings-today' as any,
									_creationTime: Date.now(),
									type: 'info',
									text: `## No Meetings Today\n\nYou don't have any meetings or events scheduled for today (${todayFormatted}).\n\nYour calendar is clear! 📅✨`,
									workspaceId: args.workspaceId,
								},
							];
						}
					} else {
						// Fall back to regular search if no calendar events
						searchResults = await ctx.runQuery(api.search.searchAll, {
							workspaceId: args.workspaceId,
							query: args.message,
							limit: 8,
						});
					}
				} catch (error) {
					console.error('[Chatbot] Error fetching calendar events:', error);
					// Fall back to regular search
					searchResults = await ctx.runQuery(api.search.searchAll, {
						workspaceId: args.workspaceId,
						query: args.message,
						limit: 8,
					});
				}
			} else {
				// Regular search for non-meeting queries
				// Increased limit for better context coverage
				searchResults = await ctx.runQuery(api.search.searchAll, {
					workspaceId: args.workspaceId,
					query: args.message,
					limit: 8, // Increased from 5 to 8 for better coverage
				});
			}

			// 3. Check if we have relevant search results
			const hasRelevantResults = searchResults && searchResults.length > 0;

			// 4. If no relevant results found, return a "no information" response
			if (!hasRelevantResults) {
				const noInfoResponse =
					"I don't have any information about that in your workspace. I can only answer questions about content that exists in your workspace.";

				// Add the "no information" response to history
				await ctx.runMutation(api.chatbot.addMessage, {
					workspaceId: args.workspaceId,
					content: noInfoResponse,
					role: 'assistant',
				});

				return {
					response: noInfoResponse,
					sources: [],
				};
			}

			// 5. Get workspace info
			const workspace = await ctx.runQuery(api.workspaces.getById, {
				id: args.workspaceId,
			});

			// 6. Get chat history
			const chatHistory = await ctx.runQuery(api.chatbot.getChatHistory, {
				workspaceId: args.workspaceId,
			});

			// 7. Prepare context from search results with enhanced formatting for meeting queries
			const context = searchResults
				.map((result) => {
					// Enhanced formatting for better AI comprehension
					const typeLabel = `[${result.type.toUpperCase()}]`;

					// For meeting queries, add extra emphasis to task-based content
					if (isMeetingQuery && result.type === 'task') {
						return `${typeLabel} **TASK MEETING:** ${result.text}`;
					}

					// For meeting queries, add emphasis to message-based content
					if (isMeetingQuery && result.type === 'message') {
						return `${typeLabel} **MESSAGE MEETING:** ${result.text}`;
					}

					// For meeting queries, add emphasis to card-based content
					if (isMeetingQuery && result.type === 'card') {
						return `${typeLabel} **BOARD CARD MEETING:** ${result.text}`;
					}

					// Default formatting for other content types
					return `${typeLabel} ${result.text}`;
				})
				.join('\n\n');

			// Debug logging for meeting queries
			if (isMeetingQuery) {
				console.log(
					'[Chatbot] Meeting query detected. Search results breakdown:'
				);
				searchResults.forEach((result, index) => {
					console.log(
						`[Chatbot] Result ${index + 1}: Type=${result.type}, Text=${result.text.substring(0, 100)}...`
					);
				});
				console.log('[Chatbot] Formatted context being sent to AI:');
				console.log(context.substring(0, 500) + '...');
			}

			// 8. Prepare conversation history (last 5 messages)
			const recentMessages = chatHistory.messages.slice(-5);
			const conversationHistory = recentMessages
				.map((msg) => {
					return `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
				})
				.join('\n');

			// 9. Construct the prompt
			const prompt = `You are a helpful workspace assistant for ${workspace?.name || 'Proddy'}, a team collaboration platform.
You can help users with information about their workspace, tasks, messages, and other features.
Be concise, friendly, and helpful.

IMPORTANT: You must ONLY answer based on the context provided below. If the context doesn't contain information relevant to the user's question, respond with "I don't have information about that in your workspace." Do NOT use your general knowledge to answer questions.

Here is the context from the workspace that might be relevant to the user's question:
${context}

Recent conversation history:
${conversationHistory || 'This is a new conversation.'}

User's question: ${args.message}

CRITICAL INSTRUCTIONS FOR MEETING/EVENT QUERIES:
1. EXAMINE ALL CONTENT TYPES: When the user asks about meetings, events, or calendar items, you MUST examine ALL content types in the context above - including [MESSAGE], [TASK], [CARD], [NOTE], and [EVENT] entries.

2. INCLUDE ALL MEETING-RELATED CONTENT: If any content mentions meetings, events, appointments, or scheduled activities, include it in your response regardless of whether it's from a message, task, board card, or note.

3. EQUAL TREATMENT: Treat tasks, messages, board cards, and notes equally - if a TASK contains meeting information, it's just as important as a MESSAGE containing meeting information.

4. ENHANCED FORMATTING FOR MEETINGS: When presenting meetings, use this EXACT format with emojis and clear structure:

## 📅 Your Meetings

### 🕐 Today
- 🗓️ **Meeting Title**
  📍 *Time: HH:MM AM/PM*
  📝 *Source: Calendar Event/Task/Message*
  💬 *Details: Brief description if available*

### 📆 Tomorrow
- 🗓️ **Meeting Title**
  📍 *Time: HH:MM AM/PM*
  📝 *Source: Calendar Event/Task/Message*
  💬 *Details: Brief description if available*

### 📅 This Week
- 🗓️ **Meeting Title**
  📍 *Day, Date at HH:MM AM/PM*
  📝 *Source: Calendar Event/Task/Message*
  💬 *Details: Brief description if available*

5. GROUPING RULES:
   - Group meetings by: Today, Tomorrow, This Week, Next Week
   - Sort within each group by time (earliest first)
   - Use clear day names (Monday, Tuesday, etc.) for dates
   - Always include the time in 12-hour format (AM/PM)

6. EMOJI USAGE:
   - 📅 for section headers
   - 🕐 🕑 🕒 etc. for different time periods
   - 🗓️ for individual meetings
   - 📍 for time/location
   - 📝 for source type
   - 💬 for additional details
   - ⚡ for urgent/high priority meetings

7. NO OMISSIONS: Do NOT skip or ignore any content type. Include ALL meetings found regardless of source.

Remember: Only answer based on the context provided. If the context doesn't contain relevant information, say "I don't have information about that in your workspace."`;

			// 10. Generate response using the Next.js API route
			const baseUrl = process.env.DEPLOY_URL;
			const apiUrl = `${baseUrl}/api/assistant`;

			console.log(`[Chatbot] Calling assistant API at: ${apiUrl}`);
			const startTime = Date.now();

			// Variable to store the assistant's response
			let assistantResponse: string;

			try {
				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						type: 'chatbot',
						message: prompt,
						workspaceContext: context,
						workspaceId: args.workspaceId,
					}),
				});

				console.log(
					`[Chatbot] Assistant API response status: ${response.status}`
				);

				if (!response.ok) {
					const errorText = await response
						.text()
						.catch(() => 'Could not read error response');
					console.error(
						`[Chatbot] Assistant API error (${response.status}):`,
						errorText
					);
					throw new Error(
						`Failed to generate response: ${response.status} ${response.statusText}`
					);
				}

				const data = await response.json();
				console.log(
					`[Chatbot] Assistant API response received in ${Date.now() - startTime}ms`
				);

				// Check for success flag in the new API response format
				if (data.success === false) {
					console.error('[Chatbot] Assistant API returned error:', data.error);
					throw new Error(data.error || 'Assistant API returned an error');
				}

				// Store the response text
				assistantResponse =
					data.response ||
					"I'm sorry, I couldn't process your request at the moment.";

				// Log processing time if available
				if (data.processingTime) {
					console.log(`[Chatbot] AI processing time: ${data.processingTime}ms`);
				}
			} catch (fetchError) {
				console.error(
					'[Chatbot] Error fetching from assistant API:',
					fetchError
				);
				throw new Error(
					fetchError instanceof Error
						? `Assistant API error: ${fetchError.message}`
						: 'Failed to communicate with assistant API'
				);
			}

			// Prepare sources for storage
			const sourcesForStorage = searchResults.map((result) => ({
				id: result._id.toString(),
				type: result.type,
				text:
					result.text.substring(0, 100) +
					(result.text.length > 100 ? '...' : ''),
			}));

			// 11. Generate navigation actions based on search results
			const navigationActions = [];

			// Check if we have calendar/meeting related content
			if (
				isMeetingQuery ||
				searchResults.some(
					(result) =>
						result.type === 'event' ||
						result.text.toLowerCase().includes('meeting') ||
						result.text.toLowerCase().includes('calendar') ||
						result.text.toLowerCase().includes('appointment')
				)
			) {
				navigationActions.push({
					label: 'View Calendar',
					type: 'calendar',
					url: '/workspace/[workspaceId]/calendar',
				});
			}

			// Check for notes content
			const notesResults = searchResults.filter(
				(result) => result.type === 'note'
			);
			if (notesResults.length > 0) {
				// Add action for the first note found
				const firstNote = notesResults[0];
				// Notes are accessed through channels, so we need the channelId
				const channelId = (firstNote as any).channelId;
				if (channelId) {
					navigationActions.push({
						label: 'View Note',
						type: 'note',
						url: `/workspace/[workspaceId]/channel/[channelId]/notes?noteId=[noteId]`,
						noteId: firstNote._id.toString(),
						channelId: channelId.toString(),
					});
				}
			}

			// Check for board cards content
			const cardResults = searchResults.filter(
				(result) => result.type === 'card'
			);
			if (cardResults.length > 0) {
				// Cards are accessed through channels, so we need the channelId
				const firstCard = cardResults[0];
				const channelId = (firstCard as any).channelId;
				if (channelId) {
					navigationActions.push({
						label: 'View Board',
						type: 'board',
						url: `/workspace/[workspaceId]/channel/[channelId]/board`,
						channelId: channelId.toString(),
					});
				}
			}

			// Check for task content
			const taskResults = searchResults.filter(
				(result) => result.type === 'task'
			);
			if (taskResults.length > 0) {
				navigationActions.push({
					label: 'View Tasks',
					type: 'task',
					url: '/workspace/[workspaceId]/tasks',
				});
			}

			// Check for message content
			const messageResults = searchResults.filter(
				(result) => result.type === 'message'
			);
			if (messageResults.length > 0) {
				navigationActions.push({
					label: 'View Chats',
					type: 'message',
					url: '/workspace/[workspaceId]/chats',
				});
			}

			// 12. Add assistant response to history with sources and actions
			await ctx.runMutation(api.chatbot.addMessage, {
				workspaceId: args.workspaceId,
				content: assistantResponse,
				role: 'assistant',
				sources: sourcesForStorage.length > 0 ? sourcesForStorage : undefined,
				actions: navigationActions.length > 0 ? navigationActions : undefined,
			});

			// 13. Return the response with navigation actions
			return {
				response: assistantResponse,
				sources: searchResults.map((result) => ({
					id: result._id,
					type: result.type,
					text:
						result.text.substring(0, 100) +
						(result.text.length > 100 ? '...' : ''),
				})),
				actions: navigationActions,
			};
		} catch (error) {
			console.error('Error generating response:', error);
			return {
				response:
					"I'm having trouble processing your request right now. Please try again later.",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},
});
