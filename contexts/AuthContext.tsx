import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { User, UserRole } from "../types";
import { trpcClient, setTrpcAuthToken } from "../lib/trpc";

const AUTH_USER_KEY = 'rork_auth_user';
const AUTH_TOKEN_KEY = 'rork_auth_token';

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

type BackendUserPayload = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  channelId: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  subscriptions: User['subscriptions'];
  memberships: User['memberships'];
  reactions: User['reactions'];
  watchHistory: User['watchHistory'];
  watchHistoryDetailed: User['watchHistoryDetailed'];
  savedVideos: User['savedVideos'];
  likedVideos: User['likedVideos'];
  rolesAssignedBy?: string;
};

const mapBackendUser = (data: BackendUserPayload): User => ({
  id: data.id,
  email: data.email,
  username: data.username,
  displayName: data.displayName ?? data.username,
  avatar: data.avatar ?? '',
  bio: data.bio ?? '',
  channelId: data.channelId ?? null,
  role: data.role,
  rolesAssignedBy: data.rolesAssignedBy,
  subscriptions: data.subscriptions ?? [],
  memberships: data.memberships ?? [],
  reactions: data.reactions ?? [],
  watchHistory: data.watchHistory ?? [],
  watchHistoryDetailed: data.watchHistoryDetailed ?? [],
  savedVideos: data.savedVideos ?? [],
  likedVideos: data.likedVideos ?? [],
  password: undefined,
  createdAt: data.createdAt,
});

const parseStoredUser = (raw: string | null): BackendUserPayload | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as BackendUserPayload;
    return parsed;
  } catch (error) {
    console.error('AuthContext parseStoredUser error', error);
    return null;
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const persistSession = useCallback(async (token: string, userPayload: BackendUserPayload) => {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [AUTH_USER_KEY, JSON.stringify(userPayload)],
    ]);
    setTrpcAuthToken(token);
    setAuthTokenState(token);
  }, []);

  const clearSession = useCallback(async () => {
    console.log('AuthContext clearSession');
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    setTrpcAuthToken(null);
    setAuthTokenState(null);
    setAuthUser(null);
    setIsAuthenticated(false);
  }, []);

  const bootstrapAuth = useCallback(async () => {
    console.log('AuthContext bootstrapAuth start');
    setIsAuthLoading(true);
    try {
      const [storedToken, storedUserRaw] = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      const token = storedToken?.[1] ?? null;
      const userPayload = parseStoredUser(storedUserRaw?.[1] ?? null);

      if (!token) {
        await clearSession();
        return;
      }

      setTrpcAuthToken(token);
      setAuthTokenState(token);

      try {
        const profile = await trpcClient.users.getProfile.query({});
        if (profile?.success && profile.user) {
          const mapped = mapBackendUser(profile.user as BackendUserPayload);
          setAuthUser(mapped);
          setIsAuthenticated(true);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile.user));
          console.log('AuthContext bootstrapAuth success', mapped.id);
          return;
        }
      } catch (error) {
        console.error('AuthContext bootstrapAuth remote error', error);
      }

      if (userPayload) {
        const mapped = mapBackendUser(userPayload);
        setAuthUser(mapped);
        setIsAuthenticated(true);
        console.log('AuthContext bootstrapAuth fallback user', mapped.id);
        return;
      }

      await clearSession();
    } catch (error) {
      console.error('AuthContext bootstrapAuth failure', error);
      await clearSession();
    } finally {
      setIsAuthLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string; user?: User; destination?: string }> => {
      try {
        const response = await trpcClient.auth.login.mutate({ email, password });

        if (!response.success || !response.token || !response.user) {
          return { success: false, error: response.error ?? 'Invalid login credentials.' };
        }

        const mapped = mapBackendUser(response.user as BackendUserPayload);
        await persistSession(response.token, response.user as BackendUserPayload);
        setAuthUser(mapped);
        setIsAuthenticated(true);
        console.log('AuthContext login success', mapped.id, mapped.role);

        return {
          success: true,
          user: mapped,
          destination: resolveRoleDestination(mapped.role),
        };
      } catch (error) {
        console.error('AuthContext login error', error);
        return { success: false, error: 'Unable to login. Please try again.' };
      }
    },
    [persistSession]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      username: string
    ): Promise<{ success: boolean; error?: string; user?: User; destination?: string }> => {
      try {
        const response = await trpcClient.auth.register.mutate({
          email,
          password,
          username,
          displayName: username,
        });

        if (!response.success || !response.token || !response.user) {
          return { success: false, error: response.error ?? 'Registration failed.' };
        }

        const mapped = mapBackendUser(response.user as BackendUserPayload);
        await persistSession(response.token, response.user as BackendUserPayload);
        setAuthUser(mapped);
        setIsAuthenticated(true);
        console.log('AuthContext register success', mapped.id, mapped.role);

        return {
          success: true,
          user: mapped,
          destination: resolveRoleDestination(mapped.role),
        };
      } catch (error) {
        console.error('AuthContext register error', error);
        return { success: false, error: 'Unable to register. Please try again.' };
      }
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await clearSession();
    console.log('AuthContext logout');
  }, [clearSession]);

  const updateAuthUser = useCallback(
    async (updates: Partial<BackendUserPayload> & { newPassword?: string; currentPassword?: string }) => {
      if (!authUser) {
        return { success: false, error: 'No authenticated user.' } as const;
      }

      try {
        const response = await trpcClient.users.updateProfile.mutate({
          username: updates.username,
          displayName: updates.displayName,
          email: updates.email,
          bio: updates.bio,
          avatar: updates.avatar,
          newPassword: updates.newPassword,
          currentPassword: updates.currentPassword,
        });

        if (!response.success || !response.user) {
          return { success: false, error: 'Unable to update profile.' } as const;
        }

        const mapped = mapBackendUser(response.user as BackendUserPayload);
        setAuthUser(mapped);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        console.log('AuthContext updateAuthUser', mapped.id);
        return { success: true, user: mapped } as const;
      } catch (error) {
        console.error('AuthContext updateAuthUser error', error);
        return { success: false, error: 'Profile update failed.' } as const;
      }
    },
    [authUser]
  );

  const assignRole = useCallback(
    async (targetUserId: string, role: UserRole) => {
      try {
        const response = await trpcClient.admin.updateUserRole.mutate({
          targetUserId,
          newRole: role,
        });

        if (!response.success || !response.user) {
          return { success: false, error: 'Unable to assign role.' } as const;
        }

        if (authUser?.id === targetUserId) {
          const mapped = mapBackendUser(response.user as BackendUserPayload);
          setAuthUser(mapped);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        }

        return { success: true, user: mapBackendUser(response.user as BackendUserPayload) } as const;
      } catch (error) {
        console.error('AuthContext assignRole error', error);
        return { success: false, error: 'Role assignment failed.' } as const;
      }
    },
    [authUser]
  );

  const isSuperAdmin = useCallback(() => authUser?.role === 'superadmin', [authUser]);
  const isAdmin = useCallback(() => authUser?.role === 'admin' || authUser?.role === 'superadmin', [authUser]);
  const isCreator = useCallback(() => authUser?.role === 'creator', [authUser]);

  const roleDestination = useMemo(() => resolveRoleDestination(authUser?.role), [authUser?.role]);

  const value = useMemo(
    () => ({
      authUser,
      authToken,
      isAuthLoading,
      isAuthenticated,
      login,
      register,
      logout,
      updateAuthUser,
      assignRole,
      isSuperAdmin,
      isAdmin,
      isCreator,
      roleDestination,
    }),
    [
      assignRole,
      authToken,
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
