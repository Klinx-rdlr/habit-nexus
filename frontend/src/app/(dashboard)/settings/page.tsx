'use client';

import { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Globe, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { updateMe, changePassword } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTheme(getTheme());
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
  }

  // Timezone
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Manila', 'Australia/Sydney'];
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

  // Account info
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

  // Change password
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
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        Settings
      </h1>

      {/* Appearance */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
              Appearance
            </p>
            <p className="mt-0.5 text-xs text-surface-500">
              Toggle between light and dark mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="h-4 w-4" />
                Dark
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Light
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-surface-500" />
          <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
            Account
          </p>
        </div>
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
      </div>

      {/* Timezone */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-surface-500" />
          <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
            Timezone
          </p>
        </div>
        <div className="space-y-3">
          <Input
            label="Search timezones"
            placeholder="e.g. America/New_York"
            value={tzFilter}
            onChange={(e) => setTzFilter(e.target.value)}
          />
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="block w-full rounded-lg border border-surface-200 bg-surface-0 px-3 py-2.5 text-sm text-surface-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
          >
            {filteredTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
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
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-surface-500" />
          <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
            Change password
          </p>
        </div>
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
      </div>
    </div>
  );
}
