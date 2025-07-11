import { NextRequest, NextResponse } from 'next/server';
import { DirectMessageTemplate } from '@/features/email/components/direct-message-template';
import { Resend } from 'resend';
import { generateUnsubscribeUrl } from '@/lib/email-unsubscribe';
import { shouldSendEmailServer } from '@/lib/email-preferences-server';

// Log the API key (masked for security)
const apiKey = process.env.RESEND_API_KEY;
console.log('Direct Message Email API - Resend API Key exists:', !!apiKey);
if (apiKey) {
	const maskedKey =
		apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
	console.log('Direct Message Email API - Masked API Key:', maskedKey);
}

const resend = new Resend(apiKey);

export async function POST(req: NextRequest) {
	try {
		console.log('Direct Message Email API received request');
		const body = await req.json();
		console.log('Direct Message Email request body:', JSON.stringify(body, null, 2));

		const {
			to,
			userId,
			firstName,
			senderName,
			messagePreview,
			workspaceUrl,
			workspaceName,
		} = body;

		// Validate required fields
		if (!to || !userId) {
			console.error('Missing required fields: to (email address) and userId');
			return NextResponse.json(
				{ error: 'Missing required fields: to (email address) and userId' },
				{ status: 400 }
			);
		}

		// Check if user wants to receive direct message emails
		const shouldSend = await shouldSendEmailServer(userId, 'directMessage');
		if (!shouldSend) {
			console.log('User has unsubscribed from direct message emails, skipping send');
			return NextResponse.json(
				{ success: true, message: 'Email skipped - user has unsubscribed' },
				{ status: 200 }
			);
		}

		// Generate unsubscribe URL
		const unsubscribeUrl = generateUnsubscribeUrl(userId, 'directMessage');

		// Set the subject for direct message emails
		const subject = `New direct message from ${senderName}`;

		console.log('Preparing direct message email template');

		// Create the direct message email template
		const emailTemplate = DirectMessageTemplate({
			firstName: firstName || 'User',
			senderName: senderName || 'Someone',
			messagePreview: messagePreview || 'You have a new direct message',
			workspaceUrl,
			workspaceName,
			unsubscribeUrl,
		});

		console.log('Sending direct message email via Resend to:', to);
		console.log('Email subject:', subject);

		// Validate the from address
		// Use Resend's default domain as a fallback if your domain isn't verified
		const fromAddress = 'Proddy <onboarding@resend.dev>';
		console.log('From address:', fromAddress);

		try {
			console.log('Attempting to send direct message email with Resend...');
			const { data, error } = await resend.emails.send({
				from: fromAddress,
				to: [to],
				subject,
				react: emailTemplate,
			});

			if (error) {
				console.error('Direct message email sending error from Resend:', error);

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
						console.error('Fallback direct message email also failed:', fallbackResult.error);
						return NextResponse.json(
							{
								error: 'Email sending failed on both attempts',
								details: error,
								fallbackError: fallbackResult.error,
							},
							{ status: 400 }
						);
					}

					console.log('Fallback direct message email sent successfully');
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
					console.error('Fallback direct message email failed with exception:', fallbackError);
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

			console.log('Direct message email sent successfully:', data);
			return NextResponse.json(
				{
					success: true,
					data,
					message: 'Direct message email sent successfully',
				},
				{ status: 200 }
			);
		} catch (resendError) {
			console.error('Resend API exception for direct message email:', resendError);
			return NextResponse.json(
				{
					error: 'Failed to send direct message email',
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
		console.error('Direct Message Email API error:', error);
		// Return a more detailed error response
		return NextResponse.json(
			{
				error: 'Failed to send direct message email',
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
