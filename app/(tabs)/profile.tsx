import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Settings, History, ThumbsUp, Bookmark, ListVideo, Video as VideoIcon, Edit, Shield } from "lucide-react-native";
import VideoEditModal from "../../components/VideoEditModal";
import { Video } from "../../types";
import { theme } from "../../constants/theme";
import { useAppState } from "../../contexts/AppStateContext";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, channels, videos } = useAppState();
  const { isSuperAdmin, isAuthenticated, isAuthLoading } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showMyVideos, setShowMyVideos] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const userChannel = currentUser.channelId 
    ? channels.find((ch) => ch.id === currentUser.channelId)
    : null;

  const myVideos = useMemo(() => {
    return videos.filter((v) => v.uploaderId === currentUser.id || v.channelId === currentUser.channelId);
  }, [videos, currentUser.id, currentUser.channelId]);

  const myShorts = myVideos.filter((v) => v.isShort);
  const myRegularVideos = myVideos.filter((v) => !v.isShort);

  const menuItems = [
    { icon: VideoIcon, label: "My Videos", count: myVideos.length, route: null, onPress: () => setShowMyVideos(!showMyVideos) },
    { icon: History, label: "History", count: currentUser.watchHistory.length, route: null },
    { icon: ThumbsUp, label: "Liked Videos", count: currentUser.likedVideos.length, route: null },
    { icon: Bookmark, label: "Saved Videos", count: currentUser.savedVideos.length, route: null },
    { icon: ListVideo, label: "Playlists", count: 0, route: null },
    ...(isSuperAdmin() ? [{ icon: Shield, label: "Admin Panel", count: null, route: "/admin" }] : []),
    { icon: Settings, label: "Settings", count: null, route: "/settings" },
  ];

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setEditModalVisible(true);
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderVideoItem = (video: Video) => (
    <TouchableOpacity
      key={video.id}
      style={styles.videoItem}
      onPress={() => router.push(`/video/${video.id}`)}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image source={{ uri: video.thumbnail }} style={styles.videoItemThumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        {video.visibility !== "public" && (
          <View style={styles.visibilityBadge}>
            <Text style={styles.visibilityBadgeText}>
              {video.visibility?.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.videoItemInfo}>
        <Text style={styles.videoItemTitle} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.videoItemStats}>
          {formatViews(video.views)} views • {video.likes} likes
        </Text>
        <TouchableOpacity
          style={styles.editVideoButton}
          onPress={(e) => {
            e.stopPropagation();
            handleEditVideo(video);
          }}
        >
          <Edit color={theme.colors.primary} size={16} />
          <Text style={styles.editVideoText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          {isSuperAdmin() && (
            <View style={styles.superAdminBadge}>
              <Shield color="#FFD700" size={16} />
              <Text style={styles.superAdminText}>SUPER ADMIN</Text>
            </View>
          )}
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
              <View key={item.label}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                    } else if (item.route) {
                      router.push(item.route);
                    }
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Icon color={theme.colors.text} size={24} />
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </View>
                  {item.count !== null && (
                    <Text style={styles.menuItemCount}>{item.count}</Text>
                  )}
                </TouchableOpacity>
                
                {item.label === "My Videos" && showMyVideos && myVideos.length > 0 && (
                  <View style={styles.myVideosSection}>
                    {myRegularVideos.length > 0 && (
                      <View style={styles.videoTypeSection}>
                        <Text style={styles.videoTypeTitle}>Videos ({myRegularVideos.length})</Text>
                        <View style={styles.videosGrid}>
                          {myRegularVideos.map(renderVideoItem)}
                        </View>
                      </View>
                    )}
                    
                    {myShorts.length > 0 && (
                      <View style={styles.videoTypeSection}>
                        <Text style={styles.videoTypeTitle}>Shorts ({myShorts.length})</Text>
                        <View style={styles.videosGrid}>
                          {myShorts.map(renderVideoItem)}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <VideoEditModal
        visible={editModalVisible}
        video={selectedVideo}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedVideo(null);
        }}
        onUpdate={() => {
          setEditModalVisible(false);
          setSelectedVideo(null);
        }}
      />
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
    marginBottom: theme.spacing.sm,
  },
  superAdminBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  superAdminText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold" as const,
    color: "#FFD700",
    letterSpacing: 1,
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
  myVideosSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  videoTypeSection: {
    marginBottom: theme.spacing.lg,
  },
  videoTypeTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  videosGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: theme.spacing.sm,
  },
  videoItem: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
  },
  videoThumbnailContainer: {
    position: "relative" as const,
  },
  videoItemThumbnail: {
    width: "100%",
    height: 100,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.border,
  },
  durationBadge: {
    position: "absolute" as const,
    bottom: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.xs,
    fontWeight: "600" as const,
  },
  visibilityBadge: {
    position: "absolute" as const,
    top: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
  },
  visibilityBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold" as const,
  },
  videoItemInfo: {
    marginTop: theme.spacing.xs,
  },
  videoItemTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "500" as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  videoItemStats: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  editVideoButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingVertical: 4,
  },
  editVideoText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
});
