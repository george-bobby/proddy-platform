// Helper function to detect assistant type based on message content
export function detectAssistantType(message: string): string {
	// GitHub-related queries
	if (
		/\b(github|create github issue|bug report|feature request|repository|repo)\b/i.test(
			message
		)
	) {
		return 'github';
	}

	// Gmail/Email-related queries
	if (/\b(gmail|email|send email|inbox|draft|compose|mail)\b/i.test(message)) {
		return 'gmail';
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
