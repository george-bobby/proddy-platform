<<<<<<< HEAD
import { sendOneSignalEmail } from '@/lib/onesignal';
import { renderMentionEmail } from '@/lib/server-email';
import { NextRequest } from 'next/server';
=======
import { MentionTemplate } from '@/features/emails/components/mention-template';
>>>>>>> parent of b3398e4 (emails)

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
<<<<<<< HEAD
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

    // Render the email template to HTML
    const htmlContent = await renderMentionEmail({
      firstName,
      mentionerName,
      channelName,
      messagePreview: messagePreview || 'Check out this mention',
      workspaceId,
      channelId,
      messageId
    });

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
=======
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello world',
      react: MentionTemplate({ firstName: 'John' }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
>>>>>>> parent of b3398e4 (emails)
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}