import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Settings, History, ThumbsUp, Bookmark, ListVideo } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, channels } = useAppState();

  const userChannel = currentUser.channelId 
    ? channels.find((ch) => ch.id === currentUser.channelId)
    : null;

  const menuItems = [
    { icon: History, label: "History", count: currentUser.watchHistory.length, route: null },
    { icon: ThumbsUp, label: "Liked Videos", count: currentUser.likedVideos.length, route: null },
    { icon: Bookmark, label: "Saved Videos", count: currentUser.savedVideos.length, route: null },
    { icon: ListVideo, label: "Playlists", count: 0, route: null },
    { icon: Settings, label: "Settings", count: null, route: "/settings" },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          <Text style={styles.displayName}>{currentUser.displayName}</Text>
          <Text style={styles.username}>@{currentUser.username}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}
          
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/edit-profile")}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {userChannel && (
            <TouchableOpacity
              style={styles.channelButton}
              onPress={() => router.push(`/channel/${userChannel.id}`)}
            >
              <Text style={styles.channelButtonText}>View My Channel</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser.subscriptions.length}</Text>
            <Text style={styles.statLabel}>Subscriptions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser.likedVideos.length}</Text>
            <Text style={styles.statLabel}>Liked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser.watchHistory.length}</Text>
            <Text style={styles.statLabel}>Watched</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={item.label} 
                style={styles.menuItem}
                onPress={() => item.route && router.push(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <Icon color={theme.colors.text} size={24} />
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                {item.count !== null && (
                  <Text style={styles.menuItemCount}>{item.count}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center" as const,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  displayName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  username: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  bio: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    textAlign: "center" as const,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    marginTop: theme.spacing.sm,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
  },
  channelButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    marginTop: theme.spacing.sm,
  },
  channelButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
  },
  statsSection: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statItem: {
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  menuSection: {
    paddingVertical: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.md,
  },
  menuItemLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: "500" as const,
  },
  menuItemCount: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});
