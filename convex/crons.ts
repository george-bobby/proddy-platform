import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Clean up old channel presence data every 30 minutes
crons.interval(
	'cleanup-old-channel-presence',
	{ minutes: 30 },
	internal.status.cleanupOldPresenceData
);

// Clean up inactive status entries every hour
crons.interval(
	'cleanup-inactive-status',
	{ hours: 1 },
	internal.status.cleanupInactiveStatus
);

// Clean up very old status entries every day at 2 AM
crons.daily(
	'cleanup-old-status-entries',
	{ hourUTC: 2, minuteUTC: 0 },
	internal.status.cleanupOldStatusEntries
);

export default crons;
