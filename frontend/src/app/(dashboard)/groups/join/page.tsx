'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LogIn } from 'lucide-react';
import { joinGroup } from '@/lib/api/groups';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

export default function JoinGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) setCode(codeParam);
  }, [searchParams]);

  const mutation = useMutation({
    mutationFn: () => joinGroup(code.trim()),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Joined group successfully!');
      router.push(`/groups/${result.groupId}`);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to join group';
      if (message.toLowerCase().includes('already')) {
        setError('You are already a member of this group');
      } else if (
        message.toLowerCase().includes('invalid') ||
        message.toLowerCase().includes('not found')
      ) {
        setError('Invalid invite code. Please check and try again.');
      } else if (message.toLowerCase().includes('expired')) {
        setError('This invite code has expired. Ask the group admin for a new one.');
      } else {
        setError(message);
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-md">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-2 text-2xl font-bold text-surface-900 dark:text-surface-100">
        Join a group
      </h1>
      <p className="mb-6 text-sm text-surface-500">
        Enter the invite code shared by a group admin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Invite code"
          placeholder="e.g., ABC123XY"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }}
          error={error}
          required
        />

        <Button
          type="submit"
          isLoading={mutation.isPending}
          disabled={!code.trim()}
          className="w-full"
        >
          <LogIn className="h-4 w-4" />
          Join group
        </Button>
      </form>
    </div>
  );
}
