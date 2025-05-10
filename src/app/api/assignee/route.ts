<<<<<<< HEAD
import { sendOneSignalEmail } from '@/lib/onesignal';
import { renderAssigneeEmail } from '@/lib/server-email';
import { format } from 'date-fns';
import { NextRequest } from 'next/server';
=======
import { AssigneeTemplate } from '@/features/emails/components/assignee-template';
>>>>>>> parent of b3398e4 (emails)

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
<<<<<<< HEAD
    const {
      recipientEmail,
      recipientName,
      assignerName,
      taskTitle,
      taskDescription,
      dueDate,
      priority,
      workspaceId,
      boardId,
      taskId
    } = await request.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !assignerName || !taskTitle || !workspaceId || !taskId) {
      return Response.json(
        { error: 'Missing required fields for task assignment email' },
        { status: 400 }
      );
    }

    // Extract first name from full name
    const firstName = recipientName.split(' ')[0];

    // Format due date if provided
    const formattedDueDate = dueDate ? format(new Date(dueDate), 'PPP') : undefined;

    // Render the email template to HTML
    const htmlContent = await renderAssigneeEmail({
      firstName,
      assignerName,
      taskTitle,
      taskDescription,
      dueDate: formattedDueDate,
      priority,
      workspaceId,
      boardId,
      taskId
    });

    // Send email using OneSignal
    const result = await sendOneSignalEmail({
      subject: `Task Assignment: ${taskTitle}`,
      htmlContent,
      emailAddress: recipientEmail,
      fromName: 'Proddy',
      fromEmail: process.env.EMAIL_FROM || 'notifications@proddy.app'
    });

    if (!result.success) {
      console.error('Error sending task assignment email:', result.error);
      return Response.json({ error: result.error }, { status: 500 });
=======
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello world',
      react: AssigneeTemplate({ firstName: 'John' }),
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