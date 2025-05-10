import { MentionTemplate } from '@/features/emails/components/mention-template';
import { sendOneSignalEmail } from '@/lib/onesignal';
import { NextRequest } from 'next/server';
import { renderToString } from 'react-dom/server';

export async function POST(request: NextRequest) {
  try {
    const {
      recipientEmail,
      recipientName,
      mentionerName,
      channelName,
      messagePreview,
      workspaceId,
      channelId,
      messageId
    } = await request.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !mentionerName || !channelName || !workspaceId || !channelId || !messageId) {
      return Response.json(
        { error: 'Missing required fields for mention email' },
        { status: 400 }
      );
    }

    // Extract first name from full name
    const firstName = recipientName.split(' ')[0];

    // Create the email content
    const emailContent = MentionTemplate({
      firstName,
      mentionerName,
      channelName,
      messagePreview: messagePreview || 'Check out this mention',
      workspaceId,
      channelId,
      messageId
    });

    // Convert React component to HTML string
    const htmlContent = renderToString(emailContent);

    // Send email using OneSignal
    const result = await sendOneSignalEmail({
      subject: `${mentionerName} mentioned you in ${channelName}`,
      htmlContent,
      emailAddress: recipientEmail,
      fromName: 'Proddy',
      fromEmail: process.env.EMAIL_FROM || 'notifications@proddy.app'
    });

    if (!result.success) {
      console.error('Error sending mention email:', result.error);
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Exception in mention email API:', error);
    return Response.json({ error: 'Failed to send mention email' }, { status: 500 });
  }
}