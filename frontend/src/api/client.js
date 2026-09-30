const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiFetch(path, options = {}) {
  return fetch(`${API_URL}${path}`, { ...options, credentials: 'include' });
}
