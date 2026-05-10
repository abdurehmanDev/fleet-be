import { IWeekRange } from '../interfaces';

/**
 * Get current ISO week range (Monday-Sunday)
 */
export function getCurrentWeekRange(): IWeekRange {
  const now = new Date();
  return getWeekRangeForDate(now);
}

/**
 * Get ISO week range for a specific date
 */
export function getWeekRangeForDate(date: Date): IWeekRange {
  const d = new Date(date);
  const day = d.getDay();

  // Monday = 1, Sunday = 0
  // diff to Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStartDate = new Date(d);
  weekStartDate.setDate(d.getDate() + diffToMonday);
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  const label = formatWeekLabel(weekStartDate, weekEndDate);

  return { weekStartDate, weekEndDate, label };
}

/**
 * Get previous week range
 */
export function getPreviousWeek(date?: Date): IWeekRange {
  const ref = date ? new Date(date) : new Date();
  ref.setDate(ref.getDate() - 7);
  return getWeekRangeForDate(ref);
}

/**
 * Get next week range
 */
export function getNextWeek(date?: Date): IWeekRange {
  const ref = date ? new Date(date) : new Date();
  ref.setDate(ref.getDate() + 7);
  return getWeekRangeForDate(ref);
}

/**
 * Format week label: "May 04 - May 10"
 */
export function formatWeekLabel(startDate: Date, endDate: Date): string {
  const start = formatDateShort(startDate);
  const end = formatDateShort(endDate);
  return `${start} - ${end}`;
}

/**
 * Format date as "Mon DD" e.g. "May 04"
 */
function formatDateShort(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  return `${month} ${day}`;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if two date ranges overlap
 */
export function weeksOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Get list of weeks between two dates
 */
export function getWeeksBetween(startDate: Date, endDate: Date): IWeekRange[] {
  const weeks: IWeekRange[] = [];
  let current = getWeekRangeForDate(startDate);

  while (current.weekStartDate <= endDate) {
    weeks.push(current);
    current = getNextWeek(current.weekStartDate);
  }

  return weeks;
}
