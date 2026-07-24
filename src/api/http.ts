import { getApiBaseUrl, getApiBearerToken } from '../config/api';
import { getPanelistAuthToken } from '../utils/panelistSession';
import { ApiError } from './ApiError';

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['message', 'error', 'detail']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const first = record.errors[0];
      if (typeof first === 'string' && first.trim()) return first.trim();
      if (first && typeof first === 'object' && 'message' in first) {
        const nested = (first as { message?: unknown }).message;
        if (typeof nested === 'string' && nested.trim()) return nested.trim();
      }
    }
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const bearerToken = token ?? getPanelistAuthToken() ?? getApiBearerToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();
  let data: T | null = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText) as T;
    } catch {
      if (!response.ok) {
        throw new ApiError(rawText.trim() || response.statusText || 'Request failed', response.status);
      }
      throw new ApiError('Invalid response from server', response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(
      extractMessage(data, response.statusText || `Request failed (${response.status})`),
      response.status
    );
  }

  if (data === null) {
    throw new ApiError('Invalid response from server', response.status);
  }

  return data;
}
