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

interface PortalProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    photo?: string | null;
    balance_point: number | string;
    status?: string | null;
    questionnaire?: string;
    questionnaire_url?: string;
    created_at?: string;
  };
}

function normalizeProfile(data: NonNullable<PortalProfileResponse['data']>): PanelistUser {
  const balance = Number(data.balance_point ?? 0);
  const photo = data.photo ?? null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    photo,
    profile_image: photo,
    balance_point: Number.isFinite(balance) ? balance : 0,
    status: data.status ?? null,
    questionnaire: data.questionnaire,
    questionnaire_url: data.questionnaire_url,
    created_at: data.created_at,
  };
}

export async function getMyProfile(): Promise<PanelistUser> {
  const response = await apiRequest<PortalProfileResponse>('/api/panelist-portal/profile');
  if (response.success === false || !response.data) {
    throw new ApiError(response.message || 'Unable to load profile.', 400);
  }
  return normalizeProfile(response.data);
}

export async function updateMyProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: File | null;
}): Promise<PanelistUser> {
  if (payload.profileImage) {
    const formData = new FormData();
    formData.append('photo', payload.profileImage);

    const token = getPanelistAuthToken();
    const response = await fetch(`${getApiBaseUrl()}/api/panelist-portal/profile`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    const data = (await response.json()) as { success?: boolean; message?: string };
    if (!response.ok || data.success === false) {
      throw new ApiError(data.message || 'Unable to update profile.', response.status);
    }
  } else {
    const response = await apiRequest<{ success: boolean; message?: string }>(
      '/api/panelist-portal/profile',
      {
        method: 'PUT',
        body: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.email !== undefined ? { email: payload.email } : {}),
          ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
        },
      }
    );
    if (response.success === false) {
      throw new ApiError(response.message || 'Unable to update profile.', 400);
    }
  }

  return getMyProfile();
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiRequest<{ success: boolean; message: string }>(
    '/api/panelist-portal/change-password',
    {
      method: 'PUT',
      body: {
        old_password: payload.currentPassword,
        new_password: payload.newPassword,
        confirm_password: payload.confirmPassword,
      },
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
    limit: number;
    totalPages: number;
    summary?: {
      total_credit: string | number;
      total_debit: string | number;
      total_balance: string | number;
    };
  }>(`/api/panelist-portal/reward-history?page=${page}&limit=${limit}`);

  return response;
}

export async function getMyRedeemRequests(page = 1, limit = 20) {
  const response = await apiRequest<{
    success: boolean;
    data: RedeemRequestItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/api/panelist-portal/redeem-requests?page=${page}&limit=${limit}`);

  return response;
}

export async function createRedeemRequest(payload: {
  reward_points: number;
  remark?: string;
  comment?: string;
}) {
  const response = await apiRequest<{ success: boolean; message: string }>(
    '/api/panelist-portal/redeem-request',
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
