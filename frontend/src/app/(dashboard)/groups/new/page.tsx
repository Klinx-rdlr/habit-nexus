'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { createGroup } from '@/lib/api/groups';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

export default function CreateGroupPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [createdGroup, setCreatedGroup] = useState<{
    id: string;
    inviteCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createGroup({ name, description: description || undefined }),
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setCreatedGroup({ id: group.id, inviteCode: group.inviteCode });
      toast.success('Group created!');
    },
    onError: () => {
      toast.error('Failed to create group');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Group name is required');
      return;
    }
    setNameError('');
    mutation.mutate();
  }

  function handleCopy() {
    navigator.clipboard.writeText(createdGroup!.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Show success state with invite code
  if (createdGroup) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-surface-200 bg-surface-0 p-8 text-center dark:border-surface-800 dark:bg-surface-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            Group created!
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Share this invite code with friends so they can join your group.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-lg font-semibold text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100">
              {createdGroup.inviteCode}
            </div>
            <Button variant="secondary" onClick={handleCopy} className="shrink-0">
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push('/groups')}
              className="flex-1"
            >
              Back to groups
            </Button>
            <Button
              onClick={() => router.push(`/groups/${createdGroup.id}`)}
              className="flex-1"
            >
              Go to group
            </Button>
          </div>
        </div>
      </div>
    );
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

      <h1 className="mb-6 text-2xl font-bold text-surface-900 dark:text-surface-100">
        Create group
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group name"
          placeholder="e.g., Morning Routine Squad"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError}
          maxLength={100}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Description (optional)
          </label>
          <textarea
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-surface-200 px-3 py-2.5 text-sm transition-colors placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100"
          />
        </div>

        <Button
          type="submit"
          isLoading={mutation.isPending}
          disabled={!name.trim()}
          className="w-full"
        >
          Create group
        </Button>
      </form>
    </div>
  );
}
