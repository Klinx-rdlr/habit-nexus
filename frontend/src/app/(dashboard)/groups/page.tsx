'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, LogIn, Users, Shield, Crown } from 'lucide-react';
import { getGroups } from '@/lib/api/groups';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';

export default function GroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: groups, isLoading, isError, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  useEffect(() => {
    document.title = 'Groups | HabitMap';
  }, []);

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="mb-4 text-surface-500">Failed to load groups.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Groups
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/groups/join')}>
            <LogIn className="h-4 w-4" />
            Join group
          </Button>
          <Button onClick={() => router.push('/groups/new')}>
            <Plus className="h-4 w-4" />
            Create group
          </Button>
        </div>
      </div>

      {!groups?.length ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="You're not in any groups yet"
          description="Create a group to start tracking habits with friends, or join one with an invite code."
          actionLabel="Create group"
          onAction={() => router.push('/groups/new')}
        />
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => router.push(`/groups/${group.id}`)}
              className="flex w-full items-center gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4 text-left transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 dark:border-surface-800 dark:bg-surface-900 dark:hover:bg-surface-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-surface-900 dark:text-surface-100">
                    {group.name}
                  </p>
                  {group.createdBy === user?.id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-2xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <Crown className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500">
                  {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                  {' \u00b7 '}
                  Created{' '}
                  {new Date(group.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Shield className="h-4 w-4 shrink-0 text-surface-300 dark:text-surface-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
