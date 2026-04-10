'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, LogIn, Users, Crown, ChevronRight } from 'lucide-react';
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
        <p className="mb-4 text-sm text-hm-text-secondary">
          Failed to load groups.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-hm-text-primary">
          Groups
        </h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/groups/join')}
          >
            <LogIn className="h-3.5 w-3.5" />
            Join group
          </Button>
          <Button size="sm" onClick={() => router.push('/groups/new')}>
            <Plus className="h-3.5 w-3.5" />
            Create group
          </Button>
        </div>
      </div>

      {!groups?.length ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No groups yet"
          description="Create a group to track habits with friends, or join one with an invite code."
          actionLabel="Create group"
          onAction={() => router.push('/groups/new')}
        />
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => router.push(`/groups/${group.id}`)}
              className="flex w-full items-center gap-4 rounded-card border border-hm-surface bg-hm-bg-elevated p-4 text-left shadow-hm-sm transition-all hover:-translate-y-0.5 hover:shadow-hm-md"
            >
              {/* Group icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-hm-accent-subtle text-hm-accent">
                <Users className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-hm-text-primary">
                    {group.name}
                  </p>
                  {group.createdBy === user?.id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-hm-warning-subtle px-2 py-0.5 text-2xs font-medium text-hm-warning">
                      <Crown className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-hm-text-tertiary">
                  {group.memberCount}{' '}
                  {group.memberCount === 1 ? 'member' : 'members'}
                  {' · '}
                  Created{' '}
                  {new Date(group.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-hm-text-tertiary" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
