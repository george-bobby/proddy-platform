/**
 * Server-side email rendering utility
 * This file provides functions to render email templates on the server
 * in a way that's compatible with Next.js App Router
 */

import { AssigneeTemplate } from '@/features/emails/components/assignee-template';
import { DirectTemplate } from '@/features/emails/components/direct-template';
import { MentionTemplate } from '@/features/emails/components/mention-template';

/**
 * Renders an assignee email template to HTML
 */
export async function renderAssigneeEmail(props: {
  firstName: string;
  assignerName: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  priority?: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
}): Promise<string> {
  // Import renderToString dynamically to avoid client-side imports
  const { renderToString } = await import('react-dom/server');
  
  // Create the email content
  const emailContent = AssigneeTemplate(props);
  
  // Render the template to an HTML string
  return renderToString(emailContent);
}

/**
 * Renders a mention email template to HTML
 */
export async function renderMentionEmail(props: {
  firstName: string;
  mentionerName: string;
  channelName: string;
  messagePreview: string;
  workspaceId: string;
  channelId: string;
  messageId: string;
}): Promise<string> {
  // Import renderToString dynamically to avoid client-side imports
  const { renderToString } = await import('react-dom/server');
  
  // Create the email content
  const emailContent = MentionTemplate(props);
  
  // Render the template to an HTML string
  return renderToString(emailContent);
}

/**
 * Renders a direct message email template to HTML
 */
export async function renderDirectEmail(props: {
  firstName: string;
  senderName: string;
  messagePreview: string;
  workspaceId: string;
  senderId: string;
  messageId: string;
}): Promise<string> {
  // Import renderToString dynamically to avoid client-side imports
  const { renderToString } = await import('react-dom/server');
  
  // Create the email content
  const emailContent = DirectTemplate(props);
  
  // Render the template to an HTML string
  return renderToString(emailContent);
}
