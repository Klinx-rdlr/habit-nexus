'use client';

import Link from 'next/link';
import { Flame, CalendarDays, Users, Trophy, CheckCircle, TrendingUp } from 'lucide-react';
import { DemoHeatmap } from './DemoHeatmap';

const FEATURES = [
  {
    icon: Flame,
    title: 'Streak tracking',
    description:
      'Never break the chain. Track daily and custom-schedule habits with automatic streak counting.',
  },
  {
    icon: CalendarDays,
    title: 'Heatmap calendar',
    description:
      'Visualize your consistency over time with GitHub-style contribution heatmaps for every habit.',
  },
  {
    icon: Users,
    title: 'Accountability groups',
    description:
      'Stay motivated with friends. Create groups, invite members, and keep each other on track.',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description:
      'Compete with your group on streaks and completion rates. See who\'s the most consistent.',
  },
];

const STATS = [
  { icon: Flame, label: 'Current streak', value: '47 days' },
  { icon: Trophy, label: 'Best streak', value: '62 days' },
  { icon: TrendingUp, label: 'Completion rate', value: '94%' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-surface-200 bg-surface-50/80 backdrop-blur-sm dark:border-surface-800 dark:bg-surface-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
              HabitMap
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="animate-fade-in">
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            Habit tracker with social accountability
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-5xl lg:text-6xl">
            Build better habits,{' '}
            <span className="text-brand-600 dark:text-brand-400">together</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-500 dark:text-surface-400">
            Track your daily habits, maintain streaks, join accountability groups, and compete on
            leaderboards. Visualize your progress with beautiful heatmaps.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-brand-700"
            >
              Start tracking for free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-surface-200 bg-surface-0 px-6 py-3 text-sm font-medium text-surface-700 shadow-soft transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Heatmap demo */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="animate-fade-in rounded-2xl border border-surface-200 bg-surface-0 p-6 shadow-card dark:border-surface-800 dark:bg-surface-900 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
              Morning Run
            </span>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Flame className="h-3 w-3" />
              47 day streak
            </span>
          </div>
          <DemoHeatmap />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 sm:text-3xl">
            Everything you need to build lasting habits
          </h2>
          <p className="mt-3 text-surface-500 dark:text-surface-400">
            Simple tools that keep you consistent and accountable.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-page-in rounded-2xl border border-surface-200 bg-surface-0 p-6 shadow-card dark:border-surface-800 dark:bg-surface-900"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                <feature.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-surface-500 dark:text-surface-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats showcase */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100 sm:text-3xl">
            See your progress at a glance
          </h2>
          <p className="mt-3 text-surface-500 dark:text-surface-400">
            Every completed day lights up your personal heatmap. Watch your consistency grow.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                <stat.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400">{stat.label}</p>
                <p className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-600 px-6 py-16 text-center dark:bg-brand-700 sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Start building better habits today
          </h2>
          <p className="mt-3 text-brand-100">
            Free and open-source. No credit card required.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-brand-600 shadow-soft transition-colors hover:bg-surface-50"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 px-4 py-8 text-center dark:border-surface-800">
        <p className="text-sm text-surface-400 dark:text-surface-500">
          Built with NestJS, Next.js, and Kubernetes
        </p>
      </footer>
    </div>
  );
}
