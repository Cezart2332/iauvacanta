export type UserRole = 'traveler' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  createdAt: string;
  favorites: string[]; // Property IDs
}

export const users: User[] = [
  {
    id: 'traveler-1',
    name: 'Alexandru Popescu',
    email: 'alex.popescu@email.com',
    password: 'password123',
    role: 'traveler',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '+40 722 111 222',
    createdAt: '2024-01-15',
    favorites: ['prop-1', 'prop-4', 'prop-9', 'prop-19'],
  },
  {
    id: 'traveler-2',
    name: 'Maria Ionescu',
    email: 'maria.ionescu@email.com',
    password: 'password123',
    role: 'traveler',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    phone: '+40 733 222 333',
    createdAt: '2024-03-20',
    favorites: ['prop-2', 'prop-7', 'prop-13'],
  },
  {
    id: 'owner-1',
    name: 'Ion Georgescu',
    email: 'ion.georgescu@email.com',
    password: 'password123',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+40 744 333 444',
    createdAt: '2023-06-10',
    favorites: [],
  },
  {
    id: 'owner-2',
    name: 'Elena Dumitrescu',
    email: 'elena.dumitrescu@email.com',
    password: 'password123',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '+40 755 444 555',
    createdAt: '2023-09-05',
    favorites: [],
  },
];

// Helper functions
export const getUserById = (id: string): User | undefined => {
  return users.find(u => u.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const validateLogin = (email: string, password: string): User | null => {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const getOwners = (): User[] => {
  return users.filter(u => u.role === 'owner');
};

export const getTravelers = (): User[] => {
  return users.filter(u => u.role === 'traveler');
};
