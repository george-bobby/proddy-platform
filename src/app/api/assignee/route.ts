import { sendOneSignalEmail } from '@/lib/onesignal';
import { renderAssigneeEmail } from '@/lib/server-email';
import { format } from 'date-fns';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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
    }

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('Exception in task assignment email API:', error);
    return Response.json({ error: 'Failed to send task assignment email' }, { status: 500 });
  }
}