import { Tabs } from "expo-router";
import { Home, Compass, PlaySquare, Tv } from "lucide-react-native";
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import MiniPlayer from "@/components/MiniPlayer";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const { authUser, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
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
          fontWeight: '600' as const,
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
          tabPress: (e) => {
            e.preventDefault();
            router.push('/shorts/shorts_placeholder');
          },
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
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
                />
              );
            }
            return (
              <View style={[styles.profilePlaceholder, focused && styles.profileImageActive]} />
            );
          },
        }}
      />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
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
    borderColor: 'transparent',
  },
});
