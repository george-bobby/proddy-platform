import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const { type, message, workspaceContext, ...otherData } = await req.json();

		if (!type) {
			return NextResponse.json(
				{ error: 'Assistant type is required' },
				{ status: 400 }
			);
		}

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			);
		}

		console.log('[Assistant Router] Processing request:', {
			type,
			message: message.substring(0, 100),
		});

		// Route to appropriate assistant module based on type
		let targetUrl: string;
		const baseUrl = process.env.NEXT_PUBLIC_DEPLOY_URL;

		switch (type.toLowerCase()) {
			case 'github':
				targetUrl = `${baseUrl}/api/assistant/old-github`;
				break;
			case 'gmail':
			case 'email':
				targetUrl = `${baseUrl}/api/assistant/gmail`;
				break;
			case 'slack':
				targetUrl = `${baseUrl}/api/assistant/slack`;
				break;
			case 'jira':
				targetUrl = `${baseUrl}/api/assistant/jira`;
				break;
			case 'notion':
				targetUrl = `${baseUrl}/api/assistant/notion`;
				break;
			case 'clickup':
				targetUrl = `${baseUrl}/api/assistant/clickup`;
				break;
			case 'chatbot':
			case 'chat':
				targetUrl = `${baseUrl}/api/assistant/chatbot`;
				break;
			case 'calendar':
			case 'meeting':
			case 'event':
				targetUrl = `${baseUrl}/api/assistant/calendar`;
				break;
			case 'notes':
			case 'note':
				targetUrl = `${baseUrl}/api/assistant/notes`;
				break;
			case 'tasks':
			case 'task':
				targetUrl = `${baseUrl}/api/assistant/tasks`;
				break;
			case 'board':
			case 'cards':
				targetUrl = `${baseUrl}/api/assistant/board`;
				break;
			default:
				return NextResponse.json(
					{
						error: `Unknown assistant type: ${type}`,
						availableTypes: [
							'github',
							'gmail',
							'slack',
							'jira',
							'notion',
							'clickup',
							'chatbot',
							'calendar',
							'notes',
							'tasks',
							'board',
						],
					},
					{ status: 400 }
				);
		}

		console.log('[Assistant Router] Routing to:', targetUrl);

		// Forward the request to the appropriate assistant module
		const response = await fetch(targetUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				workspaceContext,
				...otherData,
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Assistant module error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		// Add metadata about which assistant handled the request
		return NextResponse.json({
			...data,
			assistantType: type,
			handledBy: targetUrl.split('/').pop(),
		});
	} catch (error) {
		console.error('[Assistant Router] Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				assistantType: 'router',
			},
			{ status: 500 }
		);
	}
}

// GET endpoint to list available assistant types
export async function GET() {
	return NextResponse.json({
		availableAssistants: [
			{
				type: 'github',
				description:
					'Create issues, list repositories, manage GitHub workflows',
				capabilities: [
					'create_issue',
					'list_issues',
					'update_issue',
					'get_issue',
				],
			},
			{
				type: 'gmail',
				description: 'Send emails, manage inbox, search messages',
				capabilities: [
					'send_email',
					'list_messages',
					'search_messages',
					'create_draft',
					'manage_labels',
				],
			},
			{
				type: 'slack',
				description: 'Send messages, manage channels, team communication',
				capabilities: [
					'send_message',
					'list_channels',
					'create_channel',
					'invite_users',
					'get_user_info',
				],
			},
			{
				type: 'jira',
				description: 'Create issues, manage projects, track progress',
				capabilities: [
					'create_issue',
					'list_issues',
					'update_issue',
					'add_comment',
					'manage_projects',
				],
			},
			{
				type: 'notion',
				description: 'Create pages, manage databases, collaborate on documents',
				capabilities: [
					'create_page',
					'list_pages',
					'update_page',
					'create_database',
					'query_database',
				],
			},
			{
				type: 'clickup',
				description: 'Create tasks, manage projects, track productivity',
				capabilities: [
					'create_task',
					'list_tasks',
					'update_task',
					'add_comment',
					'manage_spaces',
				],
			},
			{
				type: 'chatbot',
				description: 'General workspace assistant with RAG capabilities',
				capabilities: [
					'search_workspace',
					'answer_questions',
					'provide_context',
				],
			},
			{
				type: 'calendar',
				description: 'Manage calendar events and meetings',
				capabilities: [
					'create_event',
					'list_events',
					'update_event',
					'delete_event',
				],
			},
			{
				type: 'notes',
				description: 'Create and manage workspace notes',
				capabilities: [
					'create_note',
					'search_notes',
					'update_note',
					'organize_notes',
				],
			},
			{
				type: 'tasks',
				description: 'Task and project management',
				capabilities: [
					'create_task',
					'update_task',
					'assign_task',
					'track_progress',
				],
			},
			{
				type: 'board',
				description: 'Kanban board and card management',
				capabilities: [
					'create_card',
					'move_card',
					'update_card',
					'manage_lists',
				],
			},
		],
		usage: {
			endpoint: '/api/assistant',
			method: 'POST',
			requiredFields: ['type', 'message'],
			optionalFields: ['workspaceContext', 'userId', 'workspaceId'],
		},
	});
}
