/**
 * Utility functions for sending emails from the application
 */

/**
 * Send a mention notification email
 * @param params Parameters for the mention email
 * @returns Response from the API
 */
export const sendMentionEmail = async (params: {
  recipientEmail: string;
  recipientName: string;
  mentionerName: string;
  channelName: string;
  messagePreview: string;
  workspaceId: string;
  channelId: string;
  messageId: string;
}) => {
  try {
    const response = await fetch('/api/mention', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error sending mention email:', errorData);
      return { success: false, error: errorData.error || 'Failed to send mention email' };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Exception sending mention email:', error);
    return { success: false, error: 'Failed to send mention email' };
  }
};

/**
 * Send a direct message notification email
 * @param params Parameters for the direct message email
 * @returns Response from the API
 */
export const sendDirectMessageEmail = async (params: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  workspaceId: string;
  senderId: string;
  messageId: string;
}) => {
  try {
    const response = await fetch('/api/direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error sending direct message email:', errorData);
      return { success: false, error: errorData.error || 'Failed to send direct message email' };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Exception sending direct message email:', error);
    return { success: false, error: 'Failed to send direct message email' };
  }
};

/**
 * Send a task assignment notification email
 * @param params Parameters for the task assignment email
 * @returns Response from the API
 */
export const sendTaskAssignmentEmail = async (params: {
  recipientEmail: string;
  recipientName: string;
  assignerName: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: number | string;
  priority?: string;
  workspaceId: string;
  boardId?: string;
  taskId: string;
}) => {
  try {
    const response = await fetch('/api/assignee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error sending task assignment email:', errorData);
      return { success: false, error: errorData.error || 'Failed to send task assignment email' };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Exception sending task assignment email:', error);
    return { success: false, error: 'Failed to send task assignment email' };
  }
};

/**
 * Extract plain text from a Quill Delta JSON or HTML string
 * @param body Message body (Quill Delta JSON or HTML)
 * @param maxLength Maximum length of the preview
 * @returns Plain text preview
 */
export const extractMessagePreview = (body: string, maxLength = 100): string => {
  try {
    // Try to parse as JSON (Quill Delta format)
    const parsedBody = JSON.parse(body);
    if (parsedBody.ops) {
      const text = parsedBody.ops
        .map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
        .join('')
        .trim();
      
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
  } catch (e) {
    // Not JSON, might be HTML or plain text
  }

  // Try to handle as HTML
  const plainText = body
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
  
  return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
};
