/**
 * Rounds a date to the nearest 15 minutes
 * @param date The date to round
 * @returns A new Date object rounded to the nearest 15 minutes
 */
export function roundToNearest15Minutes(date: Date): Date {
  const minutes = date.getMinutes();
  const remainder = minutes % 15;

  const roundedDate = new Date(date);

  if (remainder < 8) {
    // Round down
    roundedDate.setMinutes(minutes - remainder);
  } else {
    // Round up
    roundedDate.setMinutes(minutes + (15 - remainder));
  }

  // Set seconds and milliseconds to 0
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);

  return roundedDate;
}

/**
 * Formats a date in 24-hour format (HH:MM)
 * @param date The date to format
 * @returns A string in 24-hour format (HH:MM)
 */
export function formatTime24Hour(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Memoized time options to avoid recalculating
let cachedTimeOptions: string[] | null = null;

/**
 * Generates time options in 15-minute increments for a 24-hour day
 * @returns An array of time strings in 24-hour format
 */
export function generateTimeOptions(): string[] {
  // Return cached options if available
  if (cachedTimeOptions) {
    return cachedTimeOptions;
  }

  const options: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      options.push(`${hourStr}:${minuteStr}`);
    }
  }

  // Cache the options
  cachedTimeOptions = options;

  return options;
}

/**
 * Gets the index of the closest time option to the given time
 * @param time The time to find the closest option for
 * @param options The array of time options
 * @returns The index of the closest time option
 */
export function getClosestTimeOptionIndex(time: string, options: string[]): number {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  let closestIndex = 0;
  let smallestDifference = Infinity;

  options.forEach((option, index) => {
    const [optHours, optMinutes] = option.split(':').map(Number);
    const optTotalMinutes = optHours * 60 + optMinutes;

    const difference = Math.abs(totalMinutes - optTotalMinutes);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  });

  return closestIndex;
}
