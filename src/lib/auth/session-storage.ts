export const AUTH_STORAGE_KEYS = {
  accessToken: "deb_access_token",
  user: "deb_auth_user",
} as const;

export type StoredAuthUser = {
  id: string;
  username: string;
  role: string;
};

export type StoredAuthSession = {
  accessToken: string;
  user: StoredAuthUser;
};

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function saveAuthSession(session: StoredAuthSession) {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  storage.setItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken);
  storage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user));
}

export function getStoredAccessToken(): string | null {
  const storage = getBrowserStorage();

  if (!storage) {
    return null;
  }

  return storage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export function getStoredAuthUser(): StoredAuthUser | null {
  const storage = getBrowserStorage();

  if (!storage) {
    return null;
  }

  const rawUser = storage.getItem(AUTH_STORAGE_KEYS.user);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  const storage = getBrowserStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  storage.removeItem(AUTH_STORAGE_KEYS.user);
}
