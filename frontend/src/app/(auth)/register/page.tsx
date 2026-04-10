'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

interface FieldErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!email) next.email = 'Email is required';
    if (!username) next.username = 'Username is required';
    else if (username.length < 3)
      next.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      next.username = 'Only letters, numbers, and underscores';

    if (!password) next.password = 'Password is required';
    else if (password.length < 8)
      next.password = 'Must be at least 8 characters';

    if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(email, username, password);
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err.response?.data?.message;
        if (Array.isArray(msg)) {
          setServerError(msg.join('. '));
        } else {
          setServerError(msg || 'Registration failed. Please try again.');
        }
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="mb-6 text-center font-display text-xl font-semibold text-hm-text-primary">
        Create your account
      </h2>

      {serverError && (
        <div className="mb-5 rounded-card border border-hm-danger-subtle bg-hm-danger-subtle px-4 py-3 text-sm text-hm-danger">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
        />
        <Input
          label="Username"
          placeholder="your_username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          helperText="Letters, numbers, and underscores only"
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />
        <Button
          type="submit"
          isLoading={isLoading}
          className="mt-2 w-full hover:scale-[1.02] active:scale-100 transition-all"
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hm-text-tertiary">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-hm-accent transition-colors hover:text-hm-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
