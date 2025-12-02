import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { users as initialUsers, validateLogin, type User, type UserRole } from '../mock/users';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => { success: boolean; error?: string };
  updateProfile: (updates: Partial<User>) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const user = validateLogin(email, password);
    if (user) {
      // Get the latest user data from state
      const latestUser = users.find(u => u.id === user.id) || user;
      setCurrentUser(latestUser);
      return { success: true };
    }
    return { success: false, error: 'Email sau parolă incorectă' };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const register = useCallback((
    name: string, 
    email: string, 
    password: string, 
    role: UserRole
  ): { success: boolean; error?: string } => {
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Acest email este deja înregistrat' };
    }

    const newUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password,
      role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
      createdAt: new Date().toISOString().split('T')[0],
      favorites: [],
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
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
