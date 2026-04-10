'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Invalid email or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <h2 className="mb-6 text-center font-display text-xl font-semibold text-hm-text-primary">
        Welcome back
      </h2>

      {error && (
        <div className="mb-5 rounded-card border border-hm-danger-subtle bg-hm-danger-subtle px-4 py-3 text-sm text-hm-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button
          type="submit"
          isLoading={isLoading}
          className="mt-2 w-full hover:scale-[1.02] active:scale-100 transition-all"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-hm-text-tertiary">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-hm-accent transition-colors hover:text-hm-accent-hover"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
