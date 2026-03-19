import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../lib/api';
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshToken as refreshTokenRequest,
  register as registerRequest,
  type BackendUser
} from '../services/auth';

export type AppUserRole = 'owner' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  isAdmin: boolean;
  avatarUrl: string;
  createdAt: string;
  favorites: string[];
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: AppUser;
}

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string
  ) => Promise<AuthResult>;
  updateProfile: (updates: Partial<AppUser>) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'iauvacanta_current_user';

const buildAvatar = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff`;
};

const mapBackendUserToAppUser = (user: BackendUser): AppUser => {
  const fullName = user.username;

  return {
    id: String(user.id),
    name: fullName,
    email: user.email,
    role: user.isAdmin ? 'admin' : 'owner',
    isAdmin: user.isAdmin,
    avatarUrl: user.profile?.profilePictureUrl || buildAvatar(fullName),
    createdAt: new Date().toISOString(),
    favorites: []
  };
};

const parsePersistedUser = (): AppUser | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const persistUser = (user: AppUser | null): void => {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => parsePersistedUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async (): Promise<void> => {
      try {
        const response = await refreshTokenRequest();
        const mappedUser = mapBackendUserToAppUser(response.user);

        if (isMounted) {
          setCurrentUser(mappedUser);
          persistUser(mappedUser);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          persistUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await loginRequest({ email: email.trim(), password });
      const mappedUser = mapBackendUserToAppUser(response.user);
      setCurrentUser(mappedUser);
      persistUser(mappedUser);
      return { success: true, user: mappedUser };
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return { success: false, error: 'Email sau parolă incorectă.' };
      }

      return { success: false, error: 'Nu s-a putut realiza autentificarea.' };
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    _phone: string,
    _address: string
  ): Promise<AuthResult> => {
    try {
      const response = await registerRequest({
        username: name.trim(),
        email: email.trim(),
        password
      });

      const mappedUser = mapBackendUserToAppUser(response.user);
      setCurrentUser(mappedUser);
      persistUser(mappedUser);
      return { success: true, user: mappedUser };
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        return { success: false, error: 'Acest email sau username este deja înregistrat.' };
      }

      return { success: false, error: 'Nu s-a putut crea contul.' };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } catch {
      // Ignore backend failures and still clear local state.
    }

    setCurrentUser(null);
    persistUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<AppUser>): void => {
    setCurrentUser((prev) => {
      if (!prev) {
        return prev;
      }

      const updated = { ...prev, ...updates };
      persistUser(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((propertyId: string): void => {
    setCurrentUser((prev) => {
      if (!prev) {
        return prev;
      }

      const alreadyFavorite = prev.favorites.includes(propertyId);
      const nextFavorites = alreadyFavorite
        ? prev.favorites.filter((id) => id !== propertyId)
        : [...prev.favorites, propertyId];

      const updated = { ...prev, favorites: nextFavorites };
      persistUser(updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback((propertyId: string): boolean => {
    return currentUser?.favorites.includes(propertyId) ?? false;
  }, [currentUser]);

  const value = useMemo<AuthContextType>(() => ({
    currentUser,
    isAuthenticated: !!currentUser,
    isBootstrapping,
    isAdmin: currentUser?.isAdmin ?? false,
    login,
    logout,
    register,
    updateProfile,
    toggleFavorite,
    isFavorite
  }), [currentUser, isBootstrapping, login, logout, register, updateProfile, toggleFavorite, isFavorite]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
