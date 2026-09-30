import { getStoredToken } from '../auth/session';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
}
