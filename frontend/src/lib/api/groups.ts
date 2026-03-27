import { api } from './client';

export interface MemberResponse {
  id: string;
  userId: string;
  username: string;
  role: string;
  joinedAt: string;
  activeHabitCount: number | null;
  totalStreakDays: number | null;
}

export interface GroupResponse {
  id: string;
  createdBy: string;
  name: string;
  description: string | null;
  inviteCode: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupDetailResponse extends GroupResponse {
  members: MemberResponse[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalStreaks: number;
  longestStreak: number;
  habitsCompleted: number;
}

export async function createGroup(body: {
  name: string;
  description?: string;
}): Promise<GroupResponse> {
  const { data } = await api.post<GroupResponse>('/groups', body);
  return data;
}

export async function getGroups(): Promise<GroupResponse[]> {
  const { data } = await api.get<GroupResponse[]>('/groups');
  return data;
}

export async function getGroup(id: string): Promise<GroupDetailResponse> {
  const { data } = await api.get<GroupDetailResponse>(`/groups/${id}`);
  return data;
}

export async function updateGroup(
  id: string,
  body: { name?: string; description?: string },
): Promise<GroupResponse> {
  const { data } = await api.patch<GroupResponse>(`/groups/${id}`, body);
  return data;
}

export async function deleteGroup(id: string): Promise<void> {
  await api.delete(`/groups/${id}`);
}

export async function joinGroup(code: string): Promise<GroupResponse> {
  const { data } = await api.post<GroupResponse>('/groups/join', { code });
  return data;
}

export async function createInvite(
  groupId: string,
): Promise<{ code: string; expiresAt: string }> {
  const { data } = await api.post<{ code: string; expiresAt: string }>(
    `/groups/${groupId}/invite`,
  );
  return data;
}

export async function getInvite(
  groupId: string,
): Promise<{ code: string; expiresAt: string }> {
  const { data } = await api.get<{ code: string; expiresAt: string }>(
    `/groups/${groupId}/invite`,
  );
  return data;
}

export async function removeMember(
  groupId: string,
  userId: string,
): Promise<void> {
  await api.delete(`/groups/${groupId}/members/${userId}`);
}

export async function getLeaderboard(
  groupId: string,
  rankBy?: string,
): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>(
    `/groups/${groupId}/leaderboard`,
    { params: rankBy ? { rankBy } : undefined },
  );
  return data;
}
