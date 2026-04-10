'use client';

import Link from 'next/link';
import {
  Flame, CalendarDays, Users, Trophy, Bell,
  Check, ArrowRight, Repeat,
} from 'lucide-react';
import { DemoHeatmap } from './DemoHeatmap';

// ─── Static mock data ──────────────────────────────────────────────────────────

interface HabitRow {
  emoji: string;
  name: string;
  streak: number;
  completed: boolean;
  schedule: string;
}

const HABITS: HabitRow[] = [
  { emoji: '🏃', name: 'Morning Run',        streak: 47, completed: true,  schedule: 'Every day' },
  { emoji: '📚', name: 'Read 30 mins',       streak: 12, completed: false, schedule: 'Every day' },
  { emoji: '🧘', name: 'Evening Meditation', streak: 8,  completed: false, schedule: 'Mon · Wed · Fri · Sun' },
  { emoji: '🥗', name: 'No Sugar',           streak: 5,  completed: true,  schedule: 'Every day' },
];

const LEADERBOARD = [
  { rank: 1, initials: 'SK', name: 'Sarah K.', streak: 62, isYou: false },
  { rank: 2, initials: 'MR', name: 'Mike R.',  streak: 47, isYou: true  },
  { rank: 3, initials: 'AT', name: 'Alex T.',  streak: 31, isYou: false },
  { rank: 4, initials: 'JL', name: 'Jamie L.', streak: 19, isYou: false },
];

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const FEATURES = [
  {
    icon: Flame,
    title: 'Streaks that feel alive',
    description:
      "Auto-calculated streaks honor your timezone and schedule. Missing a rest day doesn't break your chain.",
  },
  {
    icon: Repeat,
    title: 'Custom schedules',
    description:
      'Not every habit is daily. Set Mon/Wed/Fri, weekdays only, or any combination that fits your life.',
  },
  {
    icon: CalendarDays,
    title: 'Heatmap visualization',
    description:
      'See your whole year at a glance. Watch the green fill in and feel the momentum build.',
  },
  {
    icon: Users,
    title: 'Accountability groups',
    description:
      "Create a group with friends, family, or coworkers. Knowing they can see your streak changes everything.",
  },
  {
    icon: Trophy,
    title: 'Group leaderboards',
    description:
      'A little friendly competition goes a long way. Compare streaks and weekly completions with your group.',
  },
  {
    icon: Bell,
    title: 'Milestone celebrations',
    description:
      'Get celebrated at 7, 30, 60, and 100 days. Your group sees your milestones too.',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function LandingPage() {
  const completedCount = HABITS.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-hm-bg">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-hm-surface bg-hm-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hm-accent">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-hm-text-primary">HabitMap</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-hm-text-secondary transition-colors hover:bg-hm-bg-sunken hover:text-hm-text-primary"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-hm-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-hm-accent-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
        <div className="animate-fade-in text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hm-accent-subtle px-3 py-1 text-xs font-semibold text-hm-accent">
            🌱 Habit tracker with social accountability
          </span>
          <h1 className="font-display mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-hm-text-primary sm:text-5xl lg:text-6xl">
            Small habits,{' '}
            <span className="text-hm-accent">built together</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-hm-text-secondary">
            Track your daily habits, visualize your progress with heatmaps, and stay consistent
            with an accountability group that actually shows up for you.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-hm-accent px-6 py-3.5 text-sm font-semibold text-white shadow-hm-md transition-all hover:bg-hm-accent-hover hover:-translate-y-0.5 hover:shadow-hm-glow active:translate-y-0"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-hm-surface bg-hm-bg-elevated px-6 py-3.5 text-sm font-semibold text-hm-text-secondary shadow-hm-sm transition-all hover:bg-hm-bg-sunken hover:text-hm-text-primary"
            >
              Log in
            </Link>
          </div>
          <p className="mt-4 text-xs text-hm-text-tertiary">No credit card. No fluff. Just habits.</p>
        </div>
      </section>

      {/* ── Dashboard mock ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="animate-slide-up overflow-hidden rounded-2xl border border-hm-surface bg-hm-bg-elevated shadow-hm-lg">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-hm-surface bg-hm-bg-sunken px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-hm-danger opacity-50" />
            <span className="h-3 w-3 rounded-full bg-hm-warning opacity-50" />
            <span className="h-3 w-3 rounded-full bg-hm-success opacity-50" />
            <span className="ml-auto font-mono text-xs text-hm-text-tertiary">
              project1.rhodereyes.dev/today
            </span>
          </div>
          {/* App content */}
          <div className="p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-hm-text-tertiary">
                  Thursday, April 10
                </p>
                <h2 className="font-display mt-1 text-xl font-bold text-hm-text-primary">
                  Good morning, Mike 👋
                </h2>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs text-hm-text-tertiary">
                  {completedCount}/{HABITS.length} done
                </span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-hm-bg-sunken">
                  <div
                    className="h-full rounded-full bg-hm-accent transition-all"
                    style={{ width: `${(completedCount / HABITS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {HABITS.map((habit) => (
                <div
                  key={habit.name}
                  className={`flex items-center gap-3 rounded-card border p-3 ${
                    habit.completed
                      ? 'border-hm-success bg-hm-success-subtle'
                      : 'border-hm-surface bg-hm-bg'
                  }`}
                  style={{ borderColor: habit.completed ? 'color-mix(in srgb, var(--hm-success) 25%, transparent)' : undefined }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hm-bg-sunken text-xl">
                    {habit.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        habit.completed
                          ? 'text-hm-text-secondary line-through decoration-hm-text-tertiary'
                          : 'text-hm-text-primary'
                      }`}
                    >
                      {habit.name}
                    </p>
                    <p className="text-2xs mt-0.5 text-hm-text-tertiary">{habit.schedule}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-hm-warning">
                      🔥 {habit.streak}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                        habit.completed
                          ? 'border-hm-success bg-hm-success'
                          : 'border-hm-surface bg-hm-bg-elevated'
                      }`}
                    >
                      {habit.completed && (
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-hm-text-primary sm:text-3xl">
            Everything you need. Nothing you don't.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-hm-text-secondary">
            Built around the things that actually make habits stick — tracking, visibility, and a
            bit of peer pressure.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-slide-up rounded-card border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-sm transition-all hover:-translate-y-0.5 hover:shadow-hm-md"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-hm-accent-subtle">
                <feature.icon className="h-5 w-5 text-hm-accent" />
              </div>
              <h3 className="font-display text-sm font-semibold text-hm-text-primary">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-hm-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Heatmap showcase ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-hm-surface bg-hm-bg-elevated p-6 shadow-hm-md sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-hm-text-primary">
                Morning Run <span className="text-hm-text-tertiary font-normal text-base">· 182 days tracked</span>
              </h2>
              <p className="mt-1 text-sm text-hm-text-secondary">
                Your consistency, laid out across the year.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-hm-accent">47</p>
                <p className="text-2xs uppercase tracking-widest text-hm-text-tertiary">Streak</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-hm-text-primary">62</p>
                <p className="text-2xs uppercase tracking-widest text-hm-text-tertiary">Best</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-hm-success">94%</p>
                <p className="text-2xs uppercase tracking-widest text-hm-text-tertiary">Rate</p>
              </div>
            </div>
          </div>
          <DemoHeatmap />
        </div>
      </section>

      {/* ── Accountability section ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-hm-accent-subtle px-3 py-1 text-xs font-semibold text-hm-accent">
              <Users className="h-3 w-3" /> Accountability groups
            </span>
            <h2 className="font-display mt-4 text-2xl font-bold text-hm-text-primary sm:text-3xl">
              You're 3× more likely to stick when your group is watching.
            </h2>
            <p className="mt-4 leading-relaxed text-hm-text-secondary">
              Create a private group with friends, family, or teammates. Everyone's streaks are
              visible to the group — which turns out to be the most effective accountability tool
              there is.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "See everyone's streaks in one shared leaderboard",
                'Get notified when a teammate hits a milestone',
                'Invite friends mid-month — streaks carry over',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-hm-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-hm-success-subtle">
                    <Check className="h-3 w-3 text-hm-success" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-hm-accent transition-colors hover:text-hm-accent-hover"
            >
              Start a group <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Leaderboard mock */}
          <div className="rounded-2xl border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold text-hm-text-primary">
                  Morning Crew 🌅
                </h3>
                <p className="text-2xs text-hm-text-tertiary mt-0.5">This week · 4 members</p>
              </div>
            </div>
            <div className="space-y-2">
              {LEADERBOARD.map((member) => (
                <div
                  key={member.rank}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    member.isYou ? 'bg-hm-accent-subtle' : 'bg-hm-bg hover:bg-hm-bg-sunken'
                  }`}
                >
                  <span className="w-5 text-center text-sm">
                    {member.rank <= 3 ? RANK_MEDALS[member.rank - 1] : member.rank}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hm-bg-sunken text-xs font-bold text-hm-text-secondary">
                    {member.initials}
                  </div>
                  <span className="flex-1 text-sm font-medium text-hm-text-primary">
                    {member.name}
                    {member.isYou && (
                      <span className="ml-1.5 text-2xs font-semibold text-hm-accent">you</span>
                    )}
                  </span>
                  <span className="font-mono text-sm font-semibold text-hm-warning">
                    🔥 {member.streak}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl bg-hm-accent px-6 py-16 text-center sm:px-12"
        >
          {/* Subtle dot texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <span className="text-4xl">🌱</span>
            <h2 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">
              Your streak starts tomorrow.
              <br />
              <span className="opacity-80">Unless you start today.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-white opacity-75">
              Free to use. Two minutes to set up your first habit.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-hm-accent shadow-hm-lg transition-all hover:bg-hm-bg hover:-translate-y-0.5 active:translate-y-0"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-white opacity-50">
              Already have one?{' '}
              <Link href="/login" className="underline underline-offset-2 opacity-100 hover:opacity-80">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-hm-surface px-4 py-7 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-hm-accent" />
            <span className="font-display text-sm font-semibold text-hm-text-secondary">
              HabitMap
            </span>
          </div>
          <p className="text-xs text-hm-text-tertiary">© 2026 HabitMap · Made with care</p>
        </div>
      </footer>
    </div>
  );
}
