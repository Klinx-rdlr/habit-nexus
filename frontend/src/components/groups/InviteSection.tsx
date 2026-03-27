'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { createInvite } from '@/lib/api/groups';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface InviteSectionProps {
  groupId: string;
  inviteCode: string;
  onCodeUpdated: (code: string) => void;
}

export function InviteSection({
  groupId,
  inviteCode,
  onCodeUpdated,
}: InviteSectionProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => createInvite(groupId),
    onSuccess: (data) => {
      onCodeUpdated(data.code);
      toast.success('New invite code generated');
    },
    onError: () => {
      toast.error('Failed to generate invite code');
    },
  });

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-800 dark:bg-surface-900">
      <h3 className="mb-3 text-sm font-medium text-surface-700 dark:text-surface-300">
        Invite code
      </h3>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-4 py-2.5 font-mono text-sm font-semibold text-surface-900 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-100">
          {inviteCode}
        </div>
        <Button variant="secondary" onClick={handleCopy} className="shrink-0">
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => generateMutation.mutate()}
          isLoading={generateMutation.isPending}
          className="shrink-0"
          title="Generate new code"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-xs text-surface-400">
        Share this code with friends so they can join your group.
      </p>
    </div>
  );
}
