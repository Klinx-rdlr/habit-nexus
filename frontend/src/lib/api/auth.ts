import { api } from './client';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  timezone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  timezone: string;
  createdAt: string;
}

export async function register(body: {
  email: string;
  username: string;
  password: string;
  timezone?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', body);
  return data;
}

export async function login(body: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', body);
  return data;
}

export async function refreshTokens(): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/refresh');
  return data;
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>('/users/me');
  return data;
}

export async function updateMe(body: {
  username?: string;
  timezone?: string;
}): Promise<UserResponse> {
  const { data } = await api.patch<UserResponse>('/users/me', body);
  return data;
}

export async function changePassword(body: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.patch('/users/me/password', body);
}
