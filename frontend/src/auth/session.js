const USER_STORAGE_KEY = 'user';

export function getStoredUser() {
  const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function storeUser(user) {
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  sessionStorage.removeItem(USER_STORAGE_KEY);
}
