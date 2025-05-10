/**
 * OneSignal API utility for sending notifications
 */

// OneSignal API endpoint for creating notifications
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';

// Types for OneSignal API
interface OneSignalEmailOptions {
  subject: string;
  htmlContent: string;
  emailAddress: string;
  fromName?: string;
  fromEmail?: string;
}

interface OneSignalResponse {
  id?: string;
  recipients?: number;
  errors?: any;
  success: boolean;
  error?: string;
}

/**
 * Send an email notification using OneSignal
 * @param options Email options
 * @returns Response from OneSignal API
 */
export async function sendOneSignalEmail(options: OneSignalEmailOptions): Promise<OneSignalResponse> {
  try {
    const { subject, htmlContent, emailAddress, fromName, fromEmail } = options;
    
    // Validate required fields
    if (!subject || !htmlContent || !emailAddress) {
      return { 
        success: false, 
        error: 'Missing required fields for email notification' 
      };
    }

    // Get OneSignal credentials from environment variables
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_API_KEY;
    
    if (!appId || !apiKey) {
      console.error('OneSignal credentials not found in environment variables');
      return { 
        success: false, 
        error: 'OneSignal credentials not configured' 
      };
    }

    // Prepare the request payload
    const payload = {
      app_id: appId,
      email_subject: subject,
      email_body: htmlContent,
      include_email_tokens: [emailAddress],
      email_from_name: fromName || process.env.EMAIL_FROM_NAME || 'Proddy',
      email_from_address: fromEmail || process.env.EMAIL_FROM || 'notifications@proddy.app',
      channel_for_external_user_ids: 'email'
    };

    // Send the request to OneSignal API
    const response = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    // Parse the response
    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return {
        success: false,
        error: data.errors?.[0] || 'Failed to send email notification'
      };
    }

    return {
      success: true,
      id: data.id,
      recipients: data.recipients
    };
  } catch (error) {
    console.error('Exception in sendOneSignalEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Render a React component to HTML string
 * @param component React component to render
 * @returns HTML string
 */
export function renderReactToHtml(component: React.ReactElement): string {
  // In a real implementation, you would use ReactDOMServer.renderToString
  // But for simplicity, we'll just return a placeholder
  return '<!DOCTYPE html><html><body>' + component + '</body></html>';
}
