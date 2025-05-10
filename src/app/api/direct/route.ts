<<<<<<< HEAD
import { sendOneSignalEmail } from '@/lib/onesignal';
import { renderDirectEmail } from '@/lib/server-email';
import { NextRequest } from 'next/server';
=======
import { DirectTemplate } from '@/features/emails/components/direct-template';
>>>>>>> parent of b3398e4 (emails)

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
<<<<<<< HEAD
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

    // Render the email template to HTML
    const htmlContent = await renderDirectEmail({
      firstName,
      senderName,
      messagePreview: messagePreview || 'You have a new message',
      workspaceId,
      senderId,
      messageId
    });

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
=======
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello world',
      react: DirectTemplate({ firstName: 'John' }),
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