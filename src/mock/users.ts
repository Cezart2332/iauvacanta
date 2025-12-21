export type UserRole = 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  address?: string;
  createdAt: string;
  favorites: string[]; // Property IDs
}

export const users: User[] = [
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
