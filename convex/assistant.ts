import { action } from './_generated/server';
import { v } from 'convex/values';
// import { api } from './_generated/api'; // Commented out to avoid TypeScript circular dependency issues
import { Id } from './_generated/dataModel';
import { detectAssistantType } from './chatbot/message_processing';
import { NavigationAction, ChatMessage } from './chatbot/chat_history';

export type GenerateResponseResult = {
	response: string;
	sources?: Array<{
		id: Id<any>;
		type: string;
		text: string;
	}>;
	actions?: NavigationAction[];
	error?: string;
};

// Generate a response using RAG and external tools (GitHub via Composio)
export const generateResponse = action({
	args: {
		workspaceId: v.id('workspaces'),
		message: v.string(),
	},
	handler: async (ctx, args): Promise<GenerateResponseResult> => {
		try {
			// 1. Add user message to history first
			await (ctx.runMutation as any)('chatbot:addMessage' as any, {
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
				const workspace = await (ctx.runQuery as any)(
					'workspaces:getById' as any,
					{
						id: args.workspaceId,
					}
				);

				// Search for relevant workspace content to provide context
				const searchResults = await (ctx.runQuery as any)(
					'search:searchAll' as any,
					{
						workspaceId: args.workspaceId,
						query: args.message,
						limit: 5,
					}
				);

				// Prepare workspace context
				const workspaceContext = `
Workspace: ${workspace?.name || 'Proddy'}
Recent relevant content:
${searchResults.map((result: any) => `[${result.type.toUpperCase()}] ${'text' in result && result.text ? result.text.substring(0, 200) : 'No description available'}`).join('\n')}
				`.trim();

				// Call Assistant API
				const baseUrl = 'https://proddy.tech';
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
						await (ctx.runMutation as any)('chatbot:addMessage' as any, {
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
					const calendarEvents = await (ctx.runQuery as any)(
						'calendar:getCalendarEvents' as any,
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
								(event: any) =>
									event.date >= startOfToday && event.date <= endOfToday
							);
						}

						// Format events as search results - this will be continued in the next part
						// due to the 300 line limit
						searchResults = relevantEvents.slice(0, 8); // Limit for now
					} else {
						// Fall back to regular search if no calendar events
						searchResults = await (ctx.runQuery as any)(
							'search:searchAll' as any,
							{
								workspaceId: args.workspaceId,
								query: args.message,
								limit: 8,
							}
						);
					}
				} catch (error) {
					console.error('[Chatbot] Error fetching calendar events:', error);
					// Fall back to regular search
					searchResults = await (ctx.runQuery as any)(
						'search:searchAll' as any,
						{
							workspaceId: args.workspaceId,
							query: args.message,
							limit: 8,
						}
					);
				}
			} else {
				// Regular search for non-meeting queries
				// Increased limit for better context coverage
				searchResults = await (ctx.runQuery as any)('search:searchAll' as any, {
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
				await (ctx.runMutation as any)('chatbot:addMessage' as any, {
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
			const workspace = await (ctx.runQuery as any)(
				'workspaces:getById' as any,
				{
					id: args.workspaceId,
				}
			);

			// 6. Get chat history
			const chatHistory = await (ctx.runQuery as any)(
				'chatbot:getChatHistory' as any,
				{
					workspaceId: args.workspaceId,
				}
			);

			// 7. Prepare context from search results with enhanced formatting for meeting queries
			const context = searchResults
				.map((result: any) => {
					// Enhanced formatting for better AI comprehension
					const typeLabel = `[${result.type.toUpperCase()}]`;

					// Extract text from different result types using type guards
					let text = '';
					if ('text' in result && result.text) {
						// Standard search results (messages, tasks, notes, cards)
						text = result.text;
					} else if (
						result.type === 'calendar-event' &&
						'message' in result &&
						result.message
					) {
						// Calendar events from messages
						text =
							result.message.body ||
							('title' in result ? result.title : '') ||
							'Calendar event';
					} else if (
						result.type === 'board-card' &&
						'boardCard' in result &&
						result.boardCard
					) {
						// Board card events
						text =
							result.boardCard.title +
							(result.boardCard.description
								? `: ${result.boardCard.description}`
								: '');
					} else if (
						result.type === 'task' &&
						'task' in result &&
						result.task
					) {
						// Task events
						text =
							result.task.title +
							(result.task.description ? `: ${result.task.description}` : '');
					} else if ('title' in result && result.title) {
						// Fallback to title
						text = result.title;
					} else {
						// Last resort fallback
						text = 'No description available';
					}

					// For meeting queries, add extra emphasis to task-based content
					if (isMeetingQuery && result.type === 'task') {
						return `${typeLabel} **TASK MEETING:** ${text}`;
					}

					// For meeting queries, add emphasis to message-based content
					if (isMeetingQuery && result.type === 'message') {
						return `${typeLabel} **MESSAGE MEETING:** ${text}`;
					}

					// For meeting queries, add emphasis to card-based content
					if (isMeetingQuery && result.type === 'card') {
						return `${typeLabel} **BOARD CARD MEETING:** ${text}`;
					}

					// Default formatting for other content types
					return `${typeLabel} ${text}`;
				})
				.join('\n\n');

			// 8. Prepare conversation history (last 5 messages)
			const recentMessages = chatHistory.messages.slice(-5);
			const conversationHistory = recentMessages
				.map((msg: ChatMessage) => {
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
			const baseUrl = 'https://proddy.tech';
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
			const sourcesForStorage = searchResults.map((result: any) => {
				// Extract text safely for storage using type guards
				let text = '';
				if ('text' in result && result.text) {
					text = result.text;
				} else if (
					result.type === 'calendar-event' &&
					'message' in result &&
					result.message
				) {
					text =
						result.message.body ||
						('title' in result ? result.title : '') ||
						'Calendar event';
				} else if (
					result.type === 'board-card' &&
					'boardCard' in result &&
					result.boardCard
				) {
					text =
						result.boardCard.title +
						(result.boardCard.description
							? `: ${result.boardCard.description}`
							: '');
				} else if (result.type === 'task' && 'task' in result && result.task) {
					text =
						result.task.title +
						(result.task.description ? `: ${result.task.description}` : '');
				} else if ('title' in result && result.title) {
					text = result.title;
				} else {
					text = 'No description available';
				}

				return {
					id: result._id.toString(),
					type: result.type,
					text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
				};
			});

			// 11. Generate navigation actions based on search results
			const navigationActions: NavigationAction[] = [];

			// Check if we have calendar/meeting related content
			if (
				isMeetingQuery ||
				searchResults.some((result: any) => {
					// Check for calendar/meeting content safely
					if (result.type === 'event' || result.type === 'calendar-event') {
						return true;
					}

					// Extract text safely for checking using type guards
					let text = '';
					if ('text' in result && result.text) {
						text = result.text;
					} else if (
						result.type === 'calendar-event' &&
						'message' in result &&
						result.message
					) {
						text =
							result.message.body ||
							('title' in result ? result.title : '') ||
							'';
					} else if (
						result.type === 'board-card' &&
						'boardCard' in result &&
						result.boardCard
					) {
						text =
							result.boardCard.title + (result.boardCard.description || '');
					} else if (
						result.type === 'task' &&
						'task' in result &&
						result.task
					) {
						text = result.task.title + (result.task.description || '');
					} else if ('title' in result && result.title) {
						text = result.title;
					}

					return (
						text.toLowerCase().includes('meeting') ||
						text.toLowerCase().includes('calendar') ||
						text.toLowerCase().includes('appointment')
					);
				})
			) {
				navigationActions.push({
					label: 'View Calendar',
					type: 'calendar',
					url: '/workspace/[workspaceId]/calendar',
				});
			}

			// Check if we have notes content
			if (searchResults.some((result: any) => result.type === 'note')) {
				navigationActions.push({
					label: 'View Notes',
					type: 'notes',
					url: '/workspace/[workspaceId]/notes',
				});
			}

			// Check if we have board content
			if (
				searchResults.some(
					(result: any) =>
						result.type === 'card' || result.type === 'board-card'
				)
			) {
				navigationActions.push({
					label: 'View Boards',
					type: 'boards',
					url: '/workspace/[workspaceId]/boards',
				});
			}

			// Check if we have chat/message content
			if (searchResults.some((result: any) => result.type === 'message')) {
				navigationActions.push({
					label: 'View Chats',
					type: 'chats',
					url: '/workspace/[workspaceId]/chats',
				});
			}

			// 12. Add assistant response to history with sources and actions
			await (ctx.runMutation as any)('chatbot:addMessage' as any, {
				workspaceId: args.workspaceId,
				content: assistantResponse,
				role: 'assistant',
				sources: sourcesForStorage.length > 0 ? sourcesForStorage : undefined,
				actions: navigationActions.length > 0 ? navigationActions : undefined,
			});

			// 13. Return the response with navigation actions
			return {
				response: assistantResponse,
				sources: searchResults.map((result: any) => {
					// Extract text safely for return using type guards
					let text = '';
					if ('text' in result && result.text) {
						text = result.text;
					} else if (
						result.type === 'calendar-event' &&
						'message' in result &&
						result.message
					) {
						text =
							result.message.body ||
							('title' in result ? result.title : '') ||
							'Calendar event';
					} else if (
						result.type === 'board-card' &&
						'boardCard' in result &&
						result.boardCard
					) {
						text =
							result.boardCard.title +
							(result.boardCard.description
								? `: ${result.boardCard.description}`
								: '');
					} else if (
						result.type === 'task' &&
						'task' in result &&
						result.task
					) {
						text =
							result.task.title +
							(result.task.description ? `: ${result.task.description}` : '');
					} else if ('title' in result && result.title) {
						text = result.title;
					} else {
						text = 'No description available';
					}

					return {
						id: result._id,
						type: result.type,
						text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
					};
				}),
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
