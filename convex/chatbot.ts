import { action, mutation, query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

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
};

type ChatHistory = {
	messages: ChatMessage[];
};

type GenerateResponseResult = {
	response: string;
	sources?: Array<{
		id: Id<any>;
		type: string;
		text: string;
	}>;
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

// Generate a response using RAG only
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

			// 2. Search for relevant content
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
							const formattedDate = eventDate.toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							});
							const formattedTime = event.time || 'No specific time';

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

							// Format the text with more details using Markdown for better rendering
							return {
								_id: event._id,
								_creationTime: event._creationTime,
								type: event.type || 'event',
								text: `### ${event.title || 'Untitled event'}\n\n**When:** ${formattedDate} at ${formattedTime}\n**Type:** ${event.type === 'calendar-event' ? 'Calendar Event' : event.type === 'board-card' ? 'Board Card' : event.type === 'task' ? 'Task' : event.type || 'Event'}${locationInfo ? `\n**Location:** ${locationInfo.replace(' | Channel: ', '').replace(' | Location: ', '')}` : ''}${additionalDetails ? `\n**Details:** ${additionalDetails.replace(' | Description: ', '')}` : ''}`,
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
							limit: 5,
						});
					}
				} catch (error) {
					console.error('[Chatbot] Error fetching calendar events:', error);
					// Fall back to regular search
					searchResults = await ctx.runQuery(api.search.searchAll, {
						workspaceId: args.workspaceId,
						query: args.message,
						limit: 5,
					});
				}
			} else {
				// Regular search for non-meeting queries
				searchResults = await ctx.runQuery(api.search.searchAll, {
					workspaceId: args.workspaceId,
					query: args.message,
					limit: 5,
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

			// 7. Prepare context from search results
			const context = searchResults
				.map((result) => {
					return `[${result.type.toUpperCase()}] ${result.text}`;
				})
				.join('\n\n');

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

SPECIAL INSTRUCTIONS FOR MEETING/EVENT QUERIES:
1. If the user asks about meetings, events, or calendar items, provide the FULL DETAILS of each event including title, date, time, and any other relevant information.
2. DO NOT just say "There is a task/event called X" - instead, list out all the details of the events.
3. For today's meetings, format the response as a clear list with times and titles.
4. If multiple events exist, organize them chronologically and present them in a structured format.
5. If the events are from different sources (messages, tasks, board cards), clearly indicate the source type for each.
6. IMPORTANT: When presenting multiple meetings, use this format:
   - Start with a summary line like "## Your Meetings for Today" or "## Upcoming Meetings"
   - For each meeting, preserve the Markdown formatting that's already in the context
   - DO NOT add extra formatting symbols or change the existing Markdown structure
   - Present the meetings in chronological order
   - Add a blank line between each meeting for better readability

Remember: Only answer based on the context provided. If the context doesn't contain relevant information, say "I don't have information about that in your workspace."`;

			// 10. Generate response using the Next.js API route
			const baseUrl = process.env.SITE_URL || 'https://proddy.tech';
			const apiUrl = baseUrl.startsWith('http')
				? `${baseUrl}/api/assistant`
				: '/api/assistant';

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
						message: prompt,
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

			// 11. Add assistant response to history with sources
			await ctx.runMutation(api.chatbot.addMessage, {
				workspaceId: args.workspaceId,
				content: assistantResponse,
				role: 'assistant',
				sources: sourcesForStorage.length > 0 ? sourcesForStorage : undefined,
			});

			// 12. Return the response
			return {
				response: assistantResponse,
				sources: searchResults.map((result) => ({
					id: result._id,
					type: result.type,
					text:
						result.text.substring(0, 100) +
						(result.text.length > 100 ? '...' : ''),
				})),
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
