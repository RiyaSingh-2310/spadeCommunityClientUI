import { getApiBaseUrl, getApiBearerToken } from '../config/api';
import { ApiError } from './ApiError';

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const bearerToken = token ?? getApiBearerToken();

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
