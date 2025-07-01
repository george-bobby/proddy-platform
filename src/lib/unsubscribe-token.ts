// Simple token generation for unsubscribe links
// In production, you should use proper JWT tokens with expiration

export function generateUnsubscribeToken(userId: string, email: string): string {
    // Simple token generation - in production use proper JWT
    const timestamp = Date.now();
    const data = `${userId}:${email}:${timestamp}`;

    // Simple base64 encoding - in production use proper signing
    return Buffer.from(data).toString('base64');
}

export function validateUnsubscribeToken(token: string): { userId: string; email: string; timestamp: number } | null {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, email, timestampStr] = decoded.split(':');
        const timestamp = parseInt(timestampStr);

        // Check if token is not older than 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (timestamp < thirtyDaysAgo) {
            return null;
        }

        return {userId, email, timestamp};
    } catch (error) {
        return null;
    }
}
