/**
 * Server-side email rendering utility
 * This file provides a function to render React email templates to HTML strings
 * in a way that's compatible with Next.js App Router
 */
import { ReactElement } from 'react';

/**
 * Renders a React email template to an HTML string
 * This is a server-side only function that should be used in API routes
 * 
 * @param template The React email template component to render
 * @returns HTML string representation of the email
 */
export async function renderEmailTemplate(template: ReactElement): Promise<string> {
  // Import renderToString dynamically to avoid client-side imports
  // This ensures the import only happens on the server
  const { renderToString } = await import('react-dom/server');
  
  // Render the template to an HTML string
  const renderedHtml = renderToString(template);
  
  // Add DOCTYPE and HTML wrapper if not present
  if (!renderedHtml.includes('<!DOCTYPE html>')) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;
  }
  
  return renderedHtml;
}
