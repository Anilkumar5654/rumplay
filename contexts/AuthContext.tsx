import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const AUTH_STORAGE_KEY = 'playtube_auth_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        setAuthUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const usersData = await AsyncStorage.getItem('playtube_users');
      if (!usersData) {
        return { success: false, error: 'No users found. Please register first.' };
      }

      const users: User[] = JSON.parse(usersData);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem('playtube_current_user', JSON.stringify(user));
      
      setAuthUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      if (!email || !password || !username || !displayName) {
        return { success: false, error: 'All fields are required.' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { success: false, error: 'Username can only contain letters, numbers, and underscores.' };
      }

      const usersData = await AsyncStorage.getItem('playtube_users');
      const users: User[] = usersData ? JSON.parse(usersData) : [];

      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return { success: false, error: 'Email already registered.' };
      }

      const usernameExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        return { success: false, error: 'Username already taken.' };
      }

      const newUser: User = {
        id: `user${Date.now()}`,
        email,
        password,
        username,
        displayName,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        bio: '',
        channelId: null,
        role: 'user',
        subscriptions: [],
        memberships: [],
        reactions: [],
        watchHistory: [],
        watchHistoryDetailed: [],
        savedVideos: [],
        likedVideos: [],
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('playtube_users', JSON.stringify(updatedUsers));
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      await AsyncStorage.setItem('playtube_current_user', JSON.stringify(newUser));

      setAuthUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateAuthUser = useCallback(async (updates: Partial<User>) => {
    if (!authUser) return;

    try {
      const updatedUser = { ...authUser, ...updates };
      
      const usersData = await AsyncStorage.getItem('playtube_users');
      if (usersData) {
        const users: User[] = JSON.parse(usersData);
        const userIndex = users.findIndex(u => u.id === authUser.id);
        if (userIndex >= 0) {
          users[userIndex] = updatedUser;
          await AsyncStorage.setItem('playtube_users', JSON.stringify(users));
        }
      }

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem('playtube_current_user', JSON.stringify(updatedUser));
      setAuthUser(updatedUser);
    } catch (error) {
      console.error('Update auth user error:', error);
    }
  }, [authUser]);

  const isSuperAdmin = useCallback(() => {
    return authUser?.role === 'superadmin' || authUser?.email === '565413anil@gmail.com';
  }, [authUser]);

  const isAdmin = useCallback(() => {
    return authUser?.role === 'admin' || isSuperAdmin();
  }, [authUser, isSuperAdmin]);

  return {
    authUser,
    isAuthLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateAuthUser,
    isSuperAdmin,
    isAdmin,
  };
});
