const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050';
const API_BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN ?? '';

export function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, '');
}

export function getApiBearerToken(): string {
  return API_BEARER_TOKEN;
}
