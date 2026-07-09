/**
 * Production API host used when a production build was deployed without VITE_API_BASE_URL.
 * Browsers cannot reach http://localhost:5050 from a public HTTPS origin — signup then
 * fails with a misleading "Network error" after reCAPTCHA succeeds.
 */
export const PRODUCTION_API_FALLBACK = 'https://adminapi-spadecommunity.onrender.com';

function isLocalApiUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

  if (fromEnv && !isLocalApiUrl(fromEnv)) {
    return normalizeBaseUrl(fromEnv);
  }

  if (import.meta.env.PROD) {
    if (typeof window !== 'undefined' && !isLocalApiUrl(window.location.origin)) {
      if (!fromEnv || isLocalApiUrl(fromEnv)) {
        console.warn(
          '[Spade] VITE_API_BASE_URL is missing or points to localhost in this production build. ' +
            `Using fallback API: ${PRODUCTION_API_FALLBACK}. ` +
            'Set VITE_API_BASE_URL in Vercel → Environment Variables and redeploy.'
        );
      }
      return PRODUCTION_API_FALLBACK;
    }
  }

  return normalizeBaseUrl(fromEnv || 'http://localhost:5050');
}

const API_BASE_URL = resolveApiBaseUrl();
const API_BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN ?? '';
const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL?.trim() ?? '';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function isApiUsingProductionFallback(): boolean {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
  return import.meta.env.PROD && (!fromEnv || isLocalApiUrl(fromEnv));
}

export function getApiBearerToken(): string {
  return API_BEARER_TOKEN;
}

export function getFrontendBaseUrl(): string {
  const fallback = typeof window !== 'undefined' ? window.location.origin : '';
  return (FRONTEND_BASE_URL || fallback).replace(/\/$/, '');
}
