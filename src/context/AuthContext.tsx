import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { users as initialUsers, validateLogin, type User } from '../mock/users';
import { ApiError } from '../lib/api';
import { loginWithLegacyCredentials, registerLegacyAccount, type LegacyUser } from '../services/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; source?: 'legacy' | 'demo' }>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string
  ) => Promise<{ success: boolean; error?: string; source?: 'legacy' | 'demo' }>;
  updateProfile: (updates: Partial<User>) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const parseLegacyRegisterDate = (registerDate: string): string => {
    const numericValue = Number(registerDate);
    if (!Number.isNaN(numericValue) && numericValue > 1000000000) {
      return new Date(numericValue * 1000).toISOString();
    }

    const parsedDate = Date.parse(registerDate);
    if (!Number.isNaN(parsedDate)) {
      return new Date(parsedDate).toISOString();
    }

    return new Date().toISOString();
  };

  const legacyToUser = (legacyUser: LegacyUser): User => ({
    id: `legacy-${legacyUser.id}`,
    name: legacyUser.name,
    email: legacyUser.email,
    password: '',
    role: 'owner',
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(legacyUser.name)}&background=0f172a&color=fff`,
    phone: legacyUser.phone || undefined,
    address: legacyUser.address || undefined,
    createdAt: parseLegacyRegisterDate(legacyUser.registerDate),
    favorites: []
  });

  const upsertUser = (user: User): void => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === user.id);
      if (exists) {
        return prev.map(u => (u.id === user.id ? user : u));
      }
      return [...prev, user];
    });
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; source?: 'legacy' | 'demo' }> => {
    const normalizedEmail = email.trim();

    try {
      const response = await loginWithLegacyCredentials(normalizedEmail, password);
      const legacyUser = legacyToUser(response.data.user);
      upsertUser(legacyUser);
      setCurrentUser(legacyUser);
      return { success: true, source: 'legacy' };
    } catch (error) {
      const fallbackUser = validateLogin(normalizedEmail, password);
      if (fallbackUser) {
        const latestUser = users.find(u => u.id === fallbackUser.id) || fallbackUser;
        setCurrentUser(latestUser);
        return { success: true, source: 'demo' };
      }

      if (error instanceof ApiError && error.status === 401) {
        return { success: false, error: 'Email sau parolă incorectă' };
      }

      console.error('Legacy auth failed', error);
      return { success: false, error: 'Nu s-a putut realiza autentificarea. Încearcă din nou.' };
    }
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string
  ): Promise<{ success: boolean; error?: string; source?: 'legacy' | 'demo' }> => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    try {
      const response = await registerLegacyAccount({
        name: trimmedName,
        email: normalizedEmail,
        password,
        phone: trimmedPhone,
        address: trimmedAddress
      });

      const legacyUser = legacyToUser(response.data.user);
      upsertUser(legacyUser);
      setCurrentUser(legacyUser);
      return { success: true, source: 'legacy' };
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        return { success: false, error: 'Acest email este deja înregistrat' };
      }

      console.error('Legacy registration failed', error);

      if (users.some(u => u.email.toLowerCase() === normalizedEmail.toLowerCase())) {
        return { success: false, error: 'Acest email este deja înregistrat' };
      }

      const newUser: User = {
        id: `owner-${Date.now()}`,
        name: trimmedName,
        email: normalizedEmail,
        password,
        role: 'owner',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=3b82f6&color=fff`,
        phone: trimmedPhone || undefined,
        address: trimmedAddress || undefined,
        createdAt: new Date().toISOString(),
        favorites: []
      };

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      return { success: true, source: 'demo' };
    }
  }, [users]);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  }, [currentUser]);

  const toggleFavorite = useCallback((propertyId: string) => {
    if (!currentUser) return;

    const isFav = currentUser.favorites.includes(propertyId);
    const newFavorites = isFav
      ? currentUser.favorites.filter(id => id !== propertyId)
      : [...currentUser.favorites, propertyId];

    const updatedUser = { ...currentUser, favorites: newFavorites };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  }, [currentUser]);

  const isFavorite = useCallback((propertyId: string): boolean => {
    return currentUser?.favorites.includes(propertyId) ?? false;
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      register,
      updateProfile,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
