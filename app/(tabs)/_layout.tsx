import { Tabs, useRouter } from "expo-router";
import { Home, Compass, PlaySquare, Tv } from "lucide-react-native";
import React from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { theme } from "../../constants/theme";
import MiniPlayer from "../../components/MiniPlayer";
import { useAuth } from "../../contexts/AuthContext";

export default function TabLayout() {
  const { authUser, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer} testID="tabs-loading-state">
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated) {
      router.push({ pathname: "/login", params: { redirect: path } });
      return;
    }

    router.push(path);
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600" as const,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: "Shorts",
            tabBarIcon: ({ color, size }) => <PlaySquare color={color} size={size + 4} />,
          }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              router.push("/shorts-feed");
            },
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            title: "Subscriptions",
            tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
          }}
          listeners={{
            tabPress: (event) => {
              if (!isAuthenticated) {
                event.preventDefault();
                handleProtectedNavigation("/(tabs)/subscriptions");
              }
            },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => {
              if (isAuthenticated && authUser?.avatar) {
                return (
                  <Image
                    source={{ uri: authUser.avatar }}
                    style={[
                      styles.profileImage,
                      focused && styles.profileImageActive,
                    ]}
                    testID="tab-profile-avatar"
                  />
                );
              }
              return (
                <View
                  style={[styles.profilePlaceholder, focused && styles.profileImageActive]}
                  testID="tab-profile-placeholder"
                />
              );
            },
          }}
          listeners={{
            tabPress: (event) => {
              if (!isAuthenticated) {
                event.preventDefault();
                handleProtectedNavigation("/profile");
              }
            },
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  profileImageActive: {
    borderColor: theme.colors.primary,
  },
  profilePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
  },
});
