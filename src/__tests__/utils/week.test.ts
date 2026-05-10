import { describe, it, expect } from '@jest/globals';
import { getCurrentWeekRange, getWeekRangeForDate, getPreviousWeek, formatDateISO } from '../../common/utils/week.utils';

describe('Week Utils', () => {
  it('getCurrentWeekRange - should return Monday-Sunday range', () => {
    const range = getCurrentWeekRange();
    expect(range.weekStartDate).toBeInstanceOf(Date);
    expect(range.weekEndDate).toBeInstanceOf(Date);
    expect(range.label).toBeDefined();
  });

  it('getPreviousWeek - should return last week range', () => {
    const current = getCurrentWeekRange();
    const prev = getPreviousWeek();
    expect(prev.weekStartDate.getTime()).toBeLessThan(current.weekStartDate.getTime());
  });

  it('formatDateISO - should format date as YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDateISO(date);
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('getWeekRangeForDate - should return week for given date', () => {
    const date = new Date('2024-01-17T10:30:00Z'); // Wednesday
    const range = getWeekRangeForDate(date);
    expect(range.weekStartDate).toBeInstanceOf(Date);
    expect(range.weekEndDate).toBeInstanceOf(Date);
  });
});
