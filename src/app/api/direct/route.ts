import { DirectTemplate } from '@/features/emails/components/direct-template';
import { sendOneSignalEmail } from '@/lib/onesignal';
import { NextRequest } from 'next/server';
import { renderToString } from 'react-dom/server';

export async function POST(request: NextRequest) {
  try {
    const {
      recipientEmail,
      recipientName,
      senderName,
      messagePreview,
      workspaceId,
      senderId,
      messageId
    } = await request.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !senderName || !workspaceId || !senderId || !messageId) {
      return Response.json(
        { error: 'Missing required fields for direct message email' },
        { status: 400 }
      );
    }

    // Extract first name from full name
    const firstName = recipientName.split(' ')[0];

    // Create the email content
    const emailContent = DirectTemplate({
      firstName,
      senderName,
      messagePreview: messagePreview || 'You have a new message',
      workspaceId,
      senderId,
      messageId
    });

    // Convert React component to HTML string
    const htmlContent = renderToString(emailContent);

    // Send email using OneSignal
    const result = await sendOneSignalEmail({
      subject: `New message from ${senderName}`,
      htmlContent,
      emailAddress: recipientEmail,
      fromName: 'Proddy',
      fromEmail: process.env.EMAIL_FROM || 'notifications@proddy.app'
    });

    if (!result.success) {
      console.error('Error sending direct message email:', result.error);
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Exception in direct message email API:', error);
    return Response.json({ error: 'Failed to send direct message email' }, { status: 500 });
  }
}