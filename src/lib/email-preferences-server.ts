import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { type EmailType, getNotificationKey } from './email-unsubscribe';

// Create a Convex client for server-side use
function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is required');
  }
  return new ConvexHttpClient(convexUrl);
}

/**
 * Check if a user should receive a specific email type (server-side)
 */
export async function shouldSendEmailServer(
  userId: string,
  emailType: EmailType
): Promise<boolean> {
  try {
    const convex = getConvexClient();
    
    // Get user notification preferences
    const preferences = await convex.query(api.preferences.getNotificationPreferencesByUserId, {
      userId,
    });
    
    if (!preferences) {
      // If no preferences found, default to allowing emails (except weekly digest)
      return emailType !== 'weeklyDigest';
    }
    
    const notificationKey = getNotificationKey(emailType);
    return preferences[notificationKey] ?? true;
  } catch (error) {
    console.error('Error checking email preferences:', error);
    // On error, default to allowing emails (except weekly digest) to avoid blocking important notifications
    return emailType !== 'weeklyDigest';
  }
}

/**
 * Update notification preferences for a user (server-side)
 */
export async function updateNotificationPreferencesServer(
  userId: string,
  emailType: EmailType,
  enabled: boolean
): Promise<boolean> {
  try {
    const convex = getConvexClient();
    const notificationKey = getNotificationKey(emailType);
    
    await convex.mutation(api.preferences.updateNotificationPreferencesByUserId, {
      userId: userId as any, // Cast to Id<'users'> type
      notificationKey,
      enabled,
    });
    
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}
