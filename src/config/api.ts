const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050';
const API_BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN ?? '';
const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL?.trim() ?? '';

export function getApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, '');
}

export function getApiBearerToken(): string {
  return API_BEARER_TOKEN;
}

export function getFrontendBaseUrl(): string {
  const fallback = typeof window !== 'undefined' ? window.location.origin : '';
  return (FRONTEND_BASE_URL || fallback).replace(/\/$/, '');
}
