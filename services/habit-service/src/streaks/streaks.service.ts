import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge, Histogram } from 'prom-client';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

@Injectable()
export class StreaksService {
  constructor(
    @InjectMetric('streak_calculation_duration_seconds')
    private readonly streakCalcDuration: Histogram,
    @InjectMetric('active_streaks_total')
    private readonly activeStreaksGauge: Gauge,
  ) {}

  updateActiveStreaksGauge(count: number) {
    this.activeStreaksGauge.set(count);
  }

  calculateStreak(
    frequencyType: string,
    scheduledDays: number[],
    completionDates: Set<string>,
    userTimezone: string,
  ): StreakResult {
    const end = this.streakCalcDuration.startTimer();
    const today = this.getTodayInTimezone(userTimezone);
    const todayDate = this.parseDate(today);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (
      completionDates.has(today) &&
      this.isScheduledDay(frequencyType, scheduledDays, todayDate)
    ) {
      currentStreak = 1;
    }

    let checkDate = this.subtractDays(todayDate, 1);
    let streakActive = true;

    for (let i = 0; i < 365; i++) {
      const dateStr = this.formatDate(checkDate);

      if (this.isScheduledDay(frequencyType, scheduledDays, checkDate)) {
        if (completionDates.has(dateStr)) {
          if (streakActive) currentStreak++;
          tempStreak++;
        } else {
          streakActive = false;
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }

      checkDate = this.subtractDays(checkDate, 1);
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    end();
    return { currentStreak, longestStreak };
  }

  getTodayInTimezone(timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  }

  isScheduledDay(
    frequencyType: string,
    scheduledDays: number[],
    date: Date,
  ): boolean {
    if (frequencyType === 'daily') return true;
    if (frequencyType === 'custom') {
      const jsDay = date.getDay();
      const mappedDay = jsDay === 0 ? 6 : jsDay - 1;
      return scheduledDays.includes(mappedDay);
    }
    return false;
  }

  parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  subtractDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() - days);
    return result;
  }
}
