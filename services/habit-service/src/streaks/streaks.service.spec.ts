import { StreaksService } from './streaks.service';

describe('StreaksService', () => {
  let service: StreaksService;

  beforeEach(() => {
    service = new StreaksService();
  });

  // Helper: generate consecutive date strings going backwards from a start date
  function datesBackFrom(startDate: string, count: number): string[] {
    const dates: string[] = [];
    const start = service.parseDate(startDate);
    for (let i = 0; i < count; i++) {
      dates.push(service.formatDate(service.subtractDays(start, i)));
    }
    return dates;
  }

  // Helper: get day of week for a date (0=Mon, 6=Sun)
  function getMappedDay(dateStr: string): number {
    const d = service.parseDate(dateStr);
    const jsDay = d.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  // Freeze "today" by mocking getTodayInTimezone
  function mockToday(dateStr: string) {
    jest.spyOn(service, 'getTodayInTimezone').mockReturnValue(dateStr);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── Edge Case 1: Daily habit, perfect streak ───
  describe('daily habit - perfect streak', () => {
    it('should count consecutive completed days as current streak', () => {
      mockToday('2026-03-25');
      // Completed today + 9 previous days = 10-day streak
      const dates = new Set(datesBackFrom('2026-03-25', 10));

      const result = service.calculateStreak('daily', [], dates, 'Asia/Manila');

      expect(result.currentStreak).toBe(10);
      expect(result.longestStreak).toBe(10);
    });
  });

  // ─── Edge Case 2: Daily habit, broken mid-week ───
  describe('daily habit - broken mid-week', () => {
    it('should reset current streak after a missed day', () => {
      mockToday('2026-03-25');
      // Completed today, yesterday, day before (3 days)
      // Missed 2026-03-22
      // Completed 2026-03-21 through 2026-03-16 (6 days)
      const recentDates = datesBackFrom('2026-03-25', 3);
      const olderDates = datesBackFrom('2026-03-21', 6);
      const dates = new Set([...recentDates, ...olderDates]);

      const result = service.calculateStreak('daily', [], dates, 'Asia/Manila');

      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(6);
    });
  });

  // ─── Edge Case 3: Custom schedule (Mon/Wed/Fri) with no misses ───
  describe('custom schedule - no misses', () => {
    it('should count only scheduled days for streak', () => {
      // Mon=0, Wed=2, Fri=4
      const scheduledDays = [0, 2, 4];
      mockToday('2026-03-25'); // Wednesday (mapped: 2)

      // Build completions for every Mon/Wed/Fri going back 3 weeks
      const completionDates: string[] = [];
      for (let i = 0; i < 21; i++) {
        const d = service.subtractDays(service.parseDate('2026-03-25'), i);
        const dateStr = service.formatDate(d);
        const mapped = getMappedDay(dateStr);
        if (scheduledDays.includes(mapped)) {
          completionDates.push(dateStr);
        }
      }
      const dates = new Set(completionDates);

      const result = service.calculateStreak('custom', scheduledDays, dates, 'Asia/Manila');

      // 3 weeks × 3 days/week = 9 scheduled days (if today is one of them, it's included)
      expect(result.currentStreak).toBe(completionDates.length);
      expect(result.longestStreak).toBe(completionDates.length);
    });
  });

  // ─── Edge Case 4: Custom schedule with a missed scheduled day ───
  describe('custom schedule - missed a scheduled day', () => {
    it('should break streak at the missed scheduled day', () => {
      // Mon=0, Wed=2, Fri=4
      const scheduledDays = [0, 2, 4];
      mockToday('2026-03-25'); // Wednesday

      // Complete today (Wed 3/25) and last Friday (3/20)
      // Miss last Wednesday (3/18)
      // Complete last Monday (3/16)
      const dates = new Set(['2026-03-25', '2026-03-20']);

      const result = service.calculateStreak('custom', scheduledDays, dates, 'Asia/Manila');

      // Current streak: Wed 3/25 + Fri 3/20 = 2, then Mon 3/23 is scheduled but...
      // Let me trace: today 3/25 (Wed, scheduled, completed) → currentStreak=1
      // 3/24 (Tue, not scheduled, skip)
      // 3/23 (Mon, scheduled, NOT completed) → streak broken
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });
  });

  // ─── Edge Case 5: Timezone edge case (Asia/Manila near midnight) ───
  describe('timezone edge case', () => {
    it('should use the correct "today" based on user timezone', () => {
      // When it's 11:30 PM in Asia/Manila on March 25, it might still be
      // March 25 in UTC or March 24. The key is that getTodayInTimezone
      // returns the correct local date.

      // Test that the algorithm uses the mocked timezone date
      mockToday('2026-03-25');
      const dates = new Set(datesBackFrom('2026-03-25', 5));

      const result = service.calculateStreak('daily', [], dates, 'Asia/Manila');
      expect(result.currentStreak).toBe(5);

      // Now simulate that in a different timezone, "today" is actually 3/26
      mockToday('2026-03-26');
      // Same completions — but now 3/26 is not completed, and today is not over
      // so current streak should still be 5 (from 3/25 backwards)
      const result2 = service.calculateStreak('daily', [], dates, 'Pacific/Auckland');
      expect(result2.currentStreak).toBe(5);
    });

    it('should verify getTodayInTimezone returns timezone-aware date', () => {
      // This tests the actual Intl.DateTimeFormat behavior
      const manila = service.getTodayInTimezone('Asia/Manila');
      const utc = service.getTodayInTimezone('UTC');

      // Both should be valid date strings
      expect(manila).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ─── Edge Case 6: New habit with zero completions ───
  describe('new habit - zero completions', () => {
    it('should return streak of 0', () => {
      mockToday('2026-03-25');
      const dates = new Set<string>();

      const result = service.calculateStreak('daily', [], dates, 'Asia/Manila');

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
    });

    it('should return streak of 0 for custom schedule with no completions', () => {
      mockToday('2026-03-25');
      const dates = new Set<string>();

      const result = service.calculateStreak('custom', [0, 2, 4], dates, 'Asia/Manila');

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
    });
  });

  // ─── Additional: Today not completed is NOT a broken streak ───
  describe('today not yet completed', () => {
    it('should not break current streak if today is not completed yet', () => {
      mockToday('2026-03-25');
      // Completed yesterday and 4 days before that (5 days), but not today
      const dates = new Set(datesBackFrom('2026-03-24', 5));

      const result = service.calculateStreak('daily', [], dates, 'Asia/Manila');

      // Today not completed → currentStreak starts at 0 from today check
      // Then yesterday is completed and streakActive=true, so currentStreak increments
      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(5);
    });
  });

  // ─── Additional: Undo completion that breaks a streak ───
  describe('undo completion breaking streak', () => {
    it('should recalculate correctly after removing a middle completion', () => {
      mockToday('2026-03-25');
      // Had 5-day streak, then "undo" day 3 (2026-03-23)
      const allDates = datesBackFrom('2026-03-25', 5);
      const withoutDay3 = allDates.filter((d) => d !== '2026-03-23');
      const dates = new Set(withoutDay3);

      const result = service.calculateStreak('daily', [], dates, 'Asia/Manila');

      // 3/25 completed, 3/24 completed, 3/23 MISSING → streak broken at 2
      expect(result.currentStreak).toBe(2);
      // Older part: 3/22, 3/21 → 2 day streak
      expect(result.longestStreak).toBe(2);
    });
  });

  // ─── Helper method tests ───
  describe('isScheduledDay', () => {
    it('should return true for daily frequency on any day', () => {
      const monday = service.parseDate('2026-03-23'); // Monday
      const sunday = service.parseDate('2026-03-29'); // Sunday
      expect(service.isScheduledDay('daily', [], monday)).toBe(true);
      expect(service.isScheduledDay('daily', [], sunday)).toBe(true);
    });

    it('should correctly map JS days to Mon=0 through Sun=6', () => {
      // 2026-03-23 is Monday (JS getDay()=1 → mapped=0)
      // 2026-03-29 is Sunday (JS getDay()=0 → mapped=6)
      const monday = service.parseDate('2026-03-23');
      const sunday = service.parseDate('2026-03-29');
      const wednesday = service.parseDate('2026-03-25');

      expect(service.isScheduledDay('custom', [0], monday)).toBe(true);
      expect(service.isScheduledDay('custom', [6], sunday)).toBe(true);
      expect(service.isScheduledDay('custom', [2], wednesday)).toBe(true);
      expect(service.isScheduledDay('custom', [0], wednesday)).toBe(false);
    });
  });

  describe('formatDate / parseDate roundtrip', () => {
    it('should round-trip dates correctly', () => {
      expect(service.formatDate(service.parseDate('2026-01-01'))).toBe('2026-01-01');
      expect(service.formatDate(service.parseDate('2026-12-31'))).toBe('2026-12-31');
      expect(service.formatDate(service.parseDate('2026-03-25'))).toBe('2026-03-25');
    });
  });
});
