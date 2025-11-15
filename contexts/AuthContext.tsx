import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'playtube_auth_user';

const resolveRoleDestination = (role: UserRole | null | undefined): string => {
  switch (role) {
    case 'superadmin':
      return '/super-admin';
    case 'admin':
      return '/admin-dashboard';
    case 'creator':
      return '/creator-studio';
    default:
      return '/(tabs)';
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const sanitizeUser = useCallback((user: User): User => {
    const { password: _password, ...rest } = user;
    return rest;
  }, []);

  const checkAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        const normalizedUser: User = {
          ...user,
          role: user.role ?? 'user',
        };
        setAuthUser(normalizedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; destination?: string }> => {
    try {
      const usersData = await AsyncStorage.getItem('playtube_users');
      if (!usersData) {
        return { success: false, error: 'No users found. Please register first.' };
      }

      const users: User[] = JSON.parse(usersData);
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const sanitized = sanitizeUser(user);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitized));
      await AsyncStorage.setItem('playtube_current_user', JSON.stringify(sanitized));

      setAuthUser(sanitized);
      setIsAuthenticated(true);

      return { success: true, user: sanitized, destination: resolveRoleDestination(sanitized.role) };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, [sanitizeUser]);

  const register = useCallback(async (
    email: string,
    password: string,
    username: string
  ): Promise<{ success: boolean; error?: string; user?: User; destination?: string }> => {
    try {
      if (!email || !password || !username) {
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

      const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return { success: false, error: 'Email already registered.' };
      }

      const usernameExists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        return { success: false, error: 'Username already taken.' };
      }

      const isSuperAdmin = email.toLowerCase() === '565413anil@gmail.com';

      const newUser: User = {
        id: `user${Date.now()}`,
        email,
        password,
        username,
        displayName: isSuperAdmin ? 'Super Admin' : username,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        bio: isSuperAdmin ? 'Super Administrator - Full Access' : '',
        channelId: null,
        role: isSuperAdmin ? 'superadmin' : 'user',
        rolesAssignedBy: isSuperAdmin ? 'system' : undefined,
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

      const sanitized = sanitizeUser(newUser);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitized));
      await AsyncStorage.setItem('playtube_current_user', JSON.stringify(sanitized));

      setAuthUser(sanitized);
      setIsAuthenticated(true);

      return { success: true, user: sanitized, destination: resolveRoleDestination(sanitized.role) };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, [sanitizeUser]);

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
    if (!authUser) {
      return;
    }

    try {
      const updatedUser = sanitizeUser({ ...authUser, ...updates });

      const usersData = await AsyncStorage.getItem('playtube_users');
      if (usersData) {
        const users: User[] = JSON.parse(usersData);
        const userIndex = users.findIndex((u) => u.id === authUser.id);
        if (userIndex >= 0) {
          users[userIndex] = { ...users[userIndex], ...updates };
          await AsyncStorage.setItem('playtube_users', JSON.stringify(users));
        }
      }

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem('playtube_current_user', JSON.stringify(updatedUser));
      setAuthUser(updatedUser);
    } catch (error) {
      console.error('Update auth user error:', error);
    }
  }, [authUser, sanitizeUser]);

  const isSuperAdmin = useCallback(() => {
    return authUser?.role === 'superadmin' || authUser?.email === '565413anil@gmail.com';
  }, [authUser]);

  const isAdmin = useCallback(() => {
    return authUser?.role === 'admin' || authUser?.role === 'superadmin';
  }, [authUser]);

  const isCreator = useCallback(() => {
    return authUser?.role === 'creator';
  }, [authUser]);

  const roleDestination = useMemo(() => resolveRoleDestination(authUser?.role), [authUser?.role]);

  const assignRole = useCallback(
    async (targetUserId: string, role: UserRole, assignedBy: string) => {
      try {
        const usersData = await AsyncStorage.getItem('playtube_users');
        if (!usersData) {
          return { success: false, error: 'No users available.' };
        }

        const users: User[] = JSON.parse(usersData);
        const targetIndex = users.findIndex((u) => u.id === targetUserId);
        if (targetIndex === -1) {
          return { success: false, error: 'User not found.' };
        }

        users[targetIndex] = {
          ...users[targetIndex],
          role,
          rolesAssignedBy: assignedBy,
        };

        await AsyncStorage.setItem('playtube_users', JSON.stringify(users));

        if (authUser?.id === targetUserId) {
          const updatedCurrent = sanitizeUser(users[targetIndex]);
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedCurrent));
          setAuthUser(updatedCurrent);
        }

        return { success: true };
      } catch (error) {
        console.error('Assign role error:', error);
        return { success: false, error: 'Unable to update role at this time.' };
      }
    },
    [authUser?.id, sanitizeUser]
  );

  const value = useMemo(
    () => ({
      authUser,
      isAuthLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateAuthUser,
      isSuperAdmin,
      isAdmin,
      isCreator,
      roleDestination,
      assignRole,
    }),
    [
      assignRole,
      authUser,
      isAdmin,
      isAuthenticated,
      isAuthLoading,
      isCreator,
      isSuperAdmin,
      login,
      logout,
      register,
      roleDestination,
      updateAuthUser,
    ]
  );

  return value;
});
