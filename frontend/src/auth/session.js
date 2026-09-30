const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'auth_token';

export function getStoredUser() {
  const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function storeUser(user, token) {
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearStoredUser() {
  sessionStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}
