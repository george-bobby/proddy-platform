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

// Send weekly digests every Monday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-monday',
	{ dayOfWeek: 'monday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'monday' }
);

// Send weekly digests every Tuesday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-tuesday',
	{ dayOfWeek: 'tuesday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'tuesday' }
);

// Send weekly digests every Wednesday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-wednesday',
	{ dayOfWeek: 'wednesday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'wednesday' }
);

// Send weekly digests every Thursday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-thursday',
	{ dayOfWeek: 'thursday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'thursday' }
);

// Send weekly digests every Friday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-friday',
	{ dayOfWeek: 'friday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'friday' }
);

// Send weekly digests every Saturday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-saturday',
	{ dayOfWeek: 'saturday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'saturday' }
);

// Send weekly digests every Sunday at 9:00 AM UTC
crons.weekly(
	'weekly-digest-sunday',
	{ dayOfWeek: 'sunday', hourUTC: 9, minuteUTC: 0 },
	internal.weeklyDigest.sendWeeklyDigests,
	{ dayOfWeek: 'sunday' }
);

export default crons;
