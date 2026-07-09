import { getApiBaseUrl } from '../config/api';
import { apiRequest } from './http';
import { ApiError } from './ApiError';
import { getPanelistAuthToken, type PanelistUser } from '../utils/panelistSession';

export interface RewardHistoryItem {
  id: number;
  reward_points: number;
  transaction_type: string;
  reward_type?: string | null;
  status?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface RedeemRequestItem {
  id: number;
  reward_points: number;
  status: string;
  remark?: string | null;
  comment?: string | null;
  created_at: string;
  action_date?: string | null;
}

export interface RewardSettings {
  minimum_payout: number;
  amazon_enabled: boolean;
  flipkart_enabled: boolean;
  paypal_enabled: boolean;
}

export async function getMyProfile(): Promise<PanelistUser> {
  const response = await apiRequest<{ success: boolean; data: PanelistUser; message?: string }>(
    '/api/panelist/me'
  );
  if (response.success === false || !response.data) {
    throw new ApiError(response.message || 'Unable to load profile.', 400);
  }
  return response.data;
}

export async function updateMyProfile(payload: {
  name?: string;
  email?: string;
  profileImage?: File | null;
}): Promise<PanelistUser> {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append('name', payload.name);
  if (payload.email !== undefined) formData.append('email', payload.email);
  if (payload.profileImage) formData.append('profile_image', payload.profileImage);

  const token = getPanelistAuthToken();
  const response = await fetch(`${getApiBaseUrl()}/api/panelist/me`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new ApiError(data.message || 'Unable to update profile.', response.status);
  }

  return data.data as PanelistUser;
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiRequest<{ success: boolean; message: string }>(
    '/api/panelist/change-password',
    {
      method: 'PUT',
      body: payload,
    }
  );

  if (response.success === false) {
    throw new ApiError(response.message || 'Unable to change password.', 400);
  }

  return response;
}

export async function getMyRewardHistory(page = 1, limit = 20) {
  const response = await apiRequest<{
    success: boolean;
    data: RewardHistoryItem[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/api/panelist/me/reward-history?page=${page}&limit=${limit}`);

  return response;
}

export async function getMyRedeemRequests(page = 1, limit = 20) {
  const response = await apiRequest<{
    success: boolean;
    data: RedeemRequestItem[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/api/panelist/me/redeem-requests?page=${page}&limit=${limit}`);

  return response;
}

export async function createRedeemRequest(payload: {
  reward_points: number;
  remark?: string;
  comment?: string;
}) {
  const response = await apiRequest<{ success: boolean; message: string }>(
    '/api/panelist/me/redeem-requests',
    {
      method: 'POST',
      body: payload,
    }
  );

  if (response.success === false) {
    throw new ApiError(response.message || 'Unable to submit redemption request.', 400);
  }

  return response;
}

export async function getRewardSettings(): Promise<RewardSettings> {
  const response = await apiRequest<{ success: boolean; data: RewardSettings }>(
    '/api/panelist/reward-settings'
  );
  return response.data;
}
