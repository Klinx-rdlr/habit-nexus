'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  Trophy,
  ShieldX,
} from 'lucide-react';
import { getGroup, removeMember, type MemberResponse } from '@/lib/api/groups';
import { MemberCard } from '@/components/groups/MemberCard';
import { InviteSection } from '@/components/groups/InviteSection';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

export default function GroupDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<MemberResponse | null>(
    null,
  );

  const {
    data: group,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id),
  });

  useEffect(() => {
    if (group) {
      document.title = `${group.name} | HabitMap`;
    }
  }, [group]);

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      toast.success(`${removingMember?.username} removed from group`);
      setRemovingMember(null);
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  if (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 403 || status === 404) {
      return (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <ShieldX className="mx-auto mb-4 h-12 w-12 text-surface-300 dark:text-surface-600" />
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            {status === 403 ? 'Not a member' : 'Group not found'}
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            {status === 403
              ? "You don't have access to this group."
              : "This group doesn't exist or has been deleted."}
          </p>
          <Button onClick={() => router.push('/groups')} className="mt-6">
            Back to groups
          </Button>
        </div>
      );
    }
  }

  if (isLoading || !group) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const currentMember = group.members.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.role === 'admin';
  const displayCode = inviteCode ?? group.inviteCode;

  const sortedMembers = [...group.members].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push('/groups')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-surface-500 transition-colors hover:text-surface-700 dark:hover:text-surface-300"
      >
        <ArrowLeft className="h-4 w-4" />
        All groups
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            {group.name}
          </h1>
          {group.description && (
            <p className="mt-1.5 text-sm text-surface-500">
              {group.description}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-surface-400">
            <Users className="h-3.5 w-3.5" />
            {group.members.length}{' '}
            {group.members.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => router.push(`/groups/${id}/leaderboard`)}
          className="shrink-0"
        >
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Button>
      </div>

      {/* Invite section (admin only) */}
      {isAdmin && (
        <div className="mb-8">
          <InviteSection
            groupId={id}
            inviteCode={displayCode}
            onCodeUpdated={setInviteCode}
          />
        </div>
      )}

      {/* Members grid */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-medium text-surface-700 dark:text-surface-300">
          Members
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sortedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUser={member.userId === user?.id}
              isAdmin={isAdmin}
              onRemove={
                isAdmin && member.userId !== user?.id
                  ? () => setRemovingMember(member)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Remove member confirmation modal */}
      <Modal
        open={!!removingMember}
        onClose={() => setRemovingMember(null)}
        title="Remove member"
      >
        <p className="mb-6 text-sm text-surface-600 dark:text-surface-400">
          Are you sure you want to remove{' '}
          <strong>{removingMember?.username}</strong> from this group? They can
          rejoin with a new invite code.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRemovingMember(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={removeMutation.isPending}
            onClick={() =>
              removingMember && removeMutation.mutate(removingMember.userId)
            }
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
