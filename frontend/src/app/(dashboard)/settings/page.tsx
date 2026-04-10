'use client';

import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Monitor, Globe, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { updateMe, changePassword } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type ThemeMode = 'light' | 'dark' | 'system';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as ThemeMode) ?? 'system';
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else if (mode === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
  if (mode === 'system') {
    localStorage.removeItem('theme');
  } else {
    localStorage.setItem('theme', mode);
  }
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-hm-surface bg-hm-bg-elevated p-5 shadow-hm-sm">
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-hm-bg-sunken">
        <Icon className="h-4 w-4 text-hm-text-secondary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-hm-text-primary">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-hm-text-tertiary">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    document.title = 'Settings | HabitMap';
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  function handleThemeChange(mode: ThemeMode) {
    setTheme(mode);
    applyTheme(mode);
  }

  // ── Timezone ──────────────────────────────────────────────────────────────
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Manila',
        'Australia/Sydney',
      ];
    }
  }, []);

  const [timezone, setTimezone] = useState(user?.timezone ?? '');
  const [tzFilter, setTzFilter] = useState('');
  const [tzSaving, setTzSaving] = useState(false);

  useEffect(() => {
    if (user?.timezone) setTimezone(user.timezone);
  }, [user?.timezone]);

  const filteredTimezones = useMemo(() => {
    if (!tzFilter) return timezones;
    const lower = tzFilter.toLowerCase();
    return timezones.filter((tz) => tz.toLowerCase().includes(lower));
  }, [timezones, tzFilter]);

  async function handleSaveTimezone() {
    if (!timezone || timezone === user?.timezone) return;
    setTzSaving(true);
    try {
      await updateMe({ timezone });
      updateUser({ timezone });
      toast.success('Timezone updated');
    } catch {
      toast.error('Failed to update timezone');
    } finally {
      setTzSaving(false);
    }
  }

  // ── Account ───────────────────────────────────────────────────────────────
  const [username, setUsername] = useState(user?.username ?? '');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user?.username]);

  async function handleSaveUsername() {
    setUsernameError('');
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }
    if (username === user?.username) return;
    setUsernameSaving(true);
    try {
      await updateMe({ username: username.trim() });
      updateUser({ username: username.trim() });
      toast.success('Username updated');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setUsernameError(msg || 'Failed to update username');
    } finally {
      setUsernameSaving(false);
    }
  }

  // ── Change password ───────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  async function handleChangePassword() {
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (newPassword.length < 8) errors.newPassword = 'Must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    try {
      await changePassword({ oldPassword: currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwErrors({});
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setPwErrors({ currentPassword: msg || 'Failed to change password' });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-6 font-display text-2xl font-bold text-hm-text-primary">
        Settings
      </h1>

      <div className="space-y-4">
        {/* ── Appearance ──────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Sun}
            title="Appearance"
            description="Choose your preferred color theme"
          />
          <div className="inline-flex w-full rounded-card border border-hm-surface bg-hm-bg-sunken p-1">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  theme === value
                    ? 'bg-hm-bg-elevated text-hm-text-primary shadow-hm-sm'
                    : 'text-hm-text-tertiary hover:text-hm-text-secondary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader icon={User} title="Account" />
          <div className="space-y-4">
            <Input
              label="Email"
              value={user?.email ?? ''}
              disabled
              helperText="Email cannot be changed"
            />
            <Input
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              error={usernameError}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSaveUsername}
                isLoading={usernameSaving}
                disabled={username === user?.username || !username.trim()}
              >
                Save username
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* ── Timezone ────────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Globe}
            title="Timezone"
            description="Used for streak calculations and daily resets"
          />
          <div className="space-y-3">
            <Input
              label="Search timezones"
              placeholder="e.g. America/New_York"
              value={tzFilter}
              onChange={(e) => setTzFilter(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-hm-text-secondary">
                Select timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="block w-full rounded-card border border-hm-surface bg-hm-bg-sunken px-4 py-3 text-sm text-hm-text-primary transition-colors focus:border-hm-accent focus:outline-none focus:ring-2 focus:ring-hm-accent focus:ring-offset-1"
              >
                {filteredTimezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveTimezone}
                isLoading={tzSaving}
                disabled={timezone === user?.timezone}
              >
                Save timezone
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* ── Change password ──────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader icon={Lock} title="Change password" />
          <div className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPwErrors((prev) => ({ ...prev, currentPassword: '' }));
              }}
              error={pwErrors.currentPassword}
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPwErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              error={pwErrors.newPassword}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPwErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={pwErrors.confirmPassword}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                isLoading={pwSaving}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Change password
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
