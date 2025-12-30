import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export type UserType = 'traveler' | 'guide' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  userType: UserType;
  location?: string;
  memberSince: string;
  // Traveler specific
  tripsCompleted?: number;
  countriesVisited?: number;
  // Guide specific
  level?: number;
  trustScore?: number;
  earnings?: number;
  completedTours?: number;
  rating?: number;
  reviews?: number;
  languages?: string[];
  badges?: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasOnboarded: boolean;
  userType: UserType;
  user: User | null;
  token: string | null;
  
  // Actions
  checkAuth: () => void;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  setUserType: (type: UserType) => void;
  completeOnboarding: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType: UserType;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  hasOnboarded: false,
  userType: null,
  user: null,
  token: null,

  checkAuth: () => {
    try {
      const token = storage.getString('token');
      const userJson = storage.getString('user');
      const hasOnboarded = storage.getBoolean('hasOnboarded') ?? false;
      const userType = storage.getString('userType') as UserType;

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ 
          isAuthenticated: true, 
          token, 
          user,
          userType: user.userType,
          hasOnboarded,
          isLoading: false 
        });
      } else {
        set({ 
          isAuthenticated: false, 
          hasOnboarded,
          userType,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string, userType: UserType) => {
    set({ isLoading: true });
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.post('/auth/login', { email, password });
      
      // Mock successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = userType === 'traveler' ? {
        id: '1',
        name: 'Alex Thompson',
        email,
        avatar: '🧑‍💼',
        userType: 'traveler',
        location: 'New York, USA',
        memberSince: '2024',
        tripsCompleted: 5,
        countriesVisited: 3,
      } : {
        id: '2',
        name: 'Pemba Sherpa',
        email,
        avatar: '👨‍🦱',
        userType: 'guide',
        location: 'Kathmandu, Nepal',
        memberSince: '2019',
        level: 2,
        trustScore: 98,
        earnings: 1247,
        completedTours: 342,
        rating: 4.9,
        reviews: 127,
        languages: ['English', 'Nepali', 'Hindi'],
        badges: ['Platform Trained', 'Female-Safe', 'First Aid Ready'],
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      // Persist to storage
      storage.set('token', mockToken);
      storage.set('user', JSON.stringify(mockUser));
      storage.set('userType', userType || '');
      
      set({ 
        isAuthenticated: true, 
        user: mockUser, 
        token: mockToken,
        userType,
        isLoading: false 
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true });
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.post('/auth/signup', data);
      
      // Mock successful signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        avatar: data.userType === 'traveler' ? '🧑‍💼' : '👤',
        userType: data.userType,
        memberSince: new Date().getFullYear().toString(),
        ...(data.userType === 'traveler' ? {
          tripsCompleted: 0,
          countriesVisited: 0,
        } : {
          level: 0,
          trustScore: 50,
          earnings: 0,
          completedTours: 0,
          rating: 0,
          reviews: 0,
          languages: ['Nepali'],
          badges: [],
        }),
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      // Persist to storage
      storage.set('token', mockToken);
      storage.set('user', JSON.stringify(mockUser));
      storage.set('userType', data.userType || '');
      
      set({ 
        isAuthenticated: true, 
        user: mockUser, 
        token: mockToken,
        userType: data.userType,
        isLoading: false 
      });
    } catch (error) {
      console.error('Signup error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    storage.delete('token');
    storage.delete('user');
    
    set({ 
      isAuthenticated: false, 
      user: null, 
      token: null 
    });
  },

  setUserType: (type: UserType) => {
    storage.set('userType', type || '');
    set({ userType: type });
  },

  completeOnboarding: () => {
    storage.set('hasOnboarded', true);
    set({ hasOnboarded: true });
  },

  updateUser: (data: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      storage.set('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));
