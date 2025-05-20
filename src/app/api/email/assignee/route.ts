import { NextRequest, NextResponse } from 'next/server';
import { AssigneeTemplate } from '@/features/email/components/assignee';
import { CardAssignmentTemplate } from '@/features/email/components/card-assignment';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
	try {
		console.log('Email API received request');
		const body = await req.json();
		console.log('Email request body:', JSON.stringify(body, null, 2));

		const {
			to,
			firstName,
			type = 'mention',
			cardTitle,
			cardDescription,
			dueDate,
			priority,
			listName,
			channelName,
			assignedBy,
			workspaceUrl,
			workspaceName,
		} = body;

		// Validate required fields
		if (!to) {
			console.error('Missing required field: to (email address)');
			return NextResponse.json(
				{ error: 'Missing required field: to (email address)' },
				{ status: 400 }
			);
		}

		let subject = 'You were mentioned in Proddy';
		let emailTemplate;

		// Choose the template based on the notification type
		if (type === 'card_assignment') {
			console.log('Preparing card assignment email template');
			subject = `Card Assignment: ${cardTitle}`;
			emailTemplate = CardAssignmentTemplate({
				firstName: firstName || 'User',
				cardTitle,
				cardDescription,
				dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : undefined,
				priority,
				listName,
				channelName,
				assignedBy,
				workspaceUrl,
				workspaceName,
			});
		} else {
			console.log('Preparing mention email template');
			// Default to mention template
			emailTemplate = AssigneeTemplate({ firstName: firstName || 'User' });
		}

		console.log('Sending email via Resend to:', to);
		console.log('Email subject:', subject);
		console.log('Resend API key exists:', !!process.env.RESEND_API_KEY);

		const { data, error } = await resend.emails.send({
			from: 'Proddy <notifications@proddy.io>',
			to: [to || 'delivered@resend.dev'],
			subject,
			react: emailTemplate,
		});

		if (error) {
			console.error('Email sending error from Resend:', error);
			return NextResponse.json(
				{
					error: error.message || 'Email sending failed',
					details: error,
				},
				{ status: 400 }
			);
		}

		console.log('Email sent successfully:', data);
		return NextResponse.json(
			{
				success: true,
				data,
				message: 'Email sent successfully',
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Email API error:', error);
		// Return a more detailed error response
		return NextResponse.json(
			{
				error: 'Failed to send email',
				message: error instanceof Error ? error.message : 'Unknown error',
				stack:
					process.env.NODE_ENV === 'development'
						? error instanceof Error
							? error.stack
							: undefined
						: undefined,
			},
			{ status: 500 }
		);
	}
}
