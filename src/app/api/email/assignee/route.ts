import { NextRequest, NextResponse } from 'next/server';
import { AssigneeTemplate } from '@/features/email/components/assignee';
import { CardAssignmentTemplate } from '@/features/email/components/card-assignment';
import { Resend } from 'resend';

// Log the API key (masked for security)
const apiKey = process.env.RESEND_API_KEY;
console.log('Resend API Key exists:', !!apiKey);
if (apiKey) {
	const maskedKey =
		apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
	console.log('Masked API Key:', maskedKey);
}

const resend = new Resend(apiKey);

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

		// Validate the from address
		// Use Resend's default domain as a fallback if your domain isn't verified
		const fromAddress = 'Proddy <onboarding@resend.dev>';
		console.log('From address:', fromAddress);

		try {
			console.log('Attempting to send email with Resend...');
			const { data, error } = await resend.emails.send({
				from: fromAddress,
				to: [to],
				subject,
				react: emailTemplate,
			});

			if (error) {
				console.error('Email sending error from Resend:', error);

				// Try with the test email as a fallback
				console.log('Trying with test email as fallback...');
				try {
					const fallbackResult = await resend.emails.send({
						from: fromAddress,
						to: ['delivered@resend.dev'],
						subject: `[TEST] ${subject}`,
						react: emailTemplate,
					});

					if (fallbackResult.error) {
						console.error('Fallback email also failed:', fallbackResult.error);
						return NextResponse.json(
							{
								error: 'Email sending failed on both attempts',
								details: error,
								fallbackError: fallbackResult.error,
							},
							{ status: 400 }
						);
					}

					console.log('Fallback email sent successfully');
					return NextResponse.json(
						{
							success: true,
							warning:
								'Used fallback email address instead of the actual recipient',
							data: fallbackResult.data,
						},
						{ status: 200 }
					);
				} catch (fallbackError) {
					console.error('Fallback email failed with exception:', fallbackError);
					return NextResponse.json(
						{
							error: 'Email sending failed on both attempts',
							details: error,
							exception:
								fallbackError instanceof Error
									? fallbackError.message
									: String(fallbackError),
						},
						{ status: 400 }
					);
				}
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
		} catch (resendError) {
			console.error('Resend API exception:', resendError);
			return NextResponse.json(
				{
					error: 'Failed to send email',
					message:
						resendError instanceof Error
							? resendError.message
							: 'Unknown error',
					stack:
						process.env.NODE_ENV === 'development'
							? resendError instanceof Error
								? resendError.stack
								: undefined
							: undefined,
				},
				{ status: 500 }
			);
		}
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
