import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Settings, History, ThumbsUp, Bookmark, ListVideo, Video as VideoIcon, Edit, LogOut } from "lucide-react-native";
import VideoEditModal from "../../components/VideoEditModal";
import { Video } from "../../types";
import { theme } from "../../constants/theme";
import { useAppState } from "../../contexts/AppStateContext";
import { useAuth } from "../../contexts/AuthContext";
import { getEnvApiRootUrl } from "@/utils/env";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, channels, videos } = useAppState();
  const { authUser, isAuthenticated, isAuthLoading, roleDestination, logout, authToken } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showMyVideos, setShowMyVideos] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myUploadedVideos, setMyUploadedVideos] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchProfileData();
      fetchMyVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authUser]);

  const fetchProfileData = async () => {
    if (!authUser || !authToken) return;
    
    try {
      setIsLoadingProfile(true);
      const apiRoot = getEnvApiRootUrl();
      const response = await fetch(`${apiRoot}/user/details?user_id=${authUser.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        const apiBaseUrl = apiRoot.replace('/api', '');
        let profilePicUrl = data.user.profile_pic;
        
        if (profilePicUrl && profilePicUrl.startsWith('/uploads/')) {
          profilePicUrl = `${apiBaseUrl}${profilePicUrl}`;
        }
        
        const processedUser = {
          ...data.user,
          profile_pic: profilePicUrl
        };
        setProfileData(processedUser);
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchMyVideos = async () => {
    if (!authToken) return;
    
    try {
      const apiRoot = getEnvApiRootUrl();
      const response = await fetch(`${apiRoot}/user/uploads`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.videos) {
        setMyUploadedVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching my videos:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const activeUser = useMemo(() => {
    if (profileData) {
      return {
        ...authUser,
        displayName: profileData.name || authUser?.displayName,
        username: profileData.username || authUser?.username,
        avatar: profileData.profile_pic || authUser?.avatar,
        bio: profileData.bio || authUser?.bio || '',
        phone: profileData.phone || authUser?.phone,
        email: profileData.email || authUser?.email,
        role: profileData.role || authUser?.role,
        id: profileData.id || authUser?.id,
        channelId: authUser?.channelId,
        subscriptions: authUser?.subscriptions || [],
        likedVideos: authUser?.likedVideos || [],
        watchHistory: authUser?.watchHistory || [],
        savedVideos: authUser?.savedVideos || [],
      };
    }
    return authUser ?? currentUser;
  }, [profileData, authUser, currentUser]);

  const userChannel = activeUser.channelId
    ? channels.find((ch) => ch.id === activeUser.channelId)
    : null;

  const myVideos = useMemo(() => {
    if (myUploadedVideos.length > 0) {
      const apiRoot = getEnvApiRootUrl();
      const apiBaseUrl = apiRoot.replace('/api', '');
      return myUploadedVideos.map((v): Video => ({
        id: v.id,
        title: v.title,
        description: v.description || '',
        thumbnail: v.thumbnail ? `${apiBaseUrl}${v.thumbnail}` : '',
        videoUrl: v.video_url ? `${apiBaseUrl}${v.video_url}` : '',
        channelId: v.channel_id || '',
        channelName: v.channel_name || '',
        channelAvatar: v.channel_avatar || '',
        views: parseInt(v.views) || 0,
        likes: parseInt(v.likes) || 0,
        dislikes: parseInt(v.dislikes) || 0,
        uploadDate: v.created_at || new Date().toISOString(),
        duration: parseInt(v.duration) || 0,
        category: v.category || 'Other',
        tags: v.tags ? (Array.isArray(v.tags) ? v.tags : v.tags.split(',')) : [],
        comments: [],
        isShort: v.is_short === 1 || v.is_short === true,
        isLive: false,
        visibility: (v.privacy || 'public') as 'public' | 'private' | 'unlisted' | 'scheduled',
        uploaderId: v.user_id,
      }));
    }
    return videos.filter((v) => v.uploaderId === activeUser.id || v.channelId === activeUser.channelId);
  }, [myUploadedVideos, videos, activeUser.id, activeUser.channelId]);

  const myShorts = myVideos.filter((v) => v.isShort);
  const myRegularVideos = myVideos.filter((v) => !v.isShort);

  const roleAction = useMemo(() => {
    switch (activeUser.role) {
      case "superadmin":
        return { label: "Admin Area", route: "/super-admin" };
      case "admin":
        return { label: "Control Panel", route: "/admin-dashboard" };
      case "creator":
        return { label: "Creator Studio", route: "/creator-studio" };
      default:
        return null;
    }
  }, [activeUser.role]);

  const menuItems = [
    { icon: VideoIcon, label: "My Videos", count: myVideos.length, route: null, onPress: () => setShowMyVideos(!showMyVideos) },
    { icon: History, label: "History", count: activeUser.watchHistory?.length || 0, route: null },
    { icon: ThumbsUp, label: "Liked Videos", count: activeUser.likedVideos?.length || 0, route: null },
    { icon: Bookmark, label: "Saved Videos", count: activeUser.savedVideos?.length || 0, route: null },
    { icon: ListVideo, label: "Playlists", count: 0, route: null },
    { icon: Settings, label: "Settings", count: null, route: "/settings", onPress: null },
    { icon: LogOut, label: "Logout", count: null, route: null, onPress: handleLogout },
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

  if (isAuthLoading || isLoadingProfile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: activeUser.avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=profile" }}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>{activeUser.displayName}</Text>
          <Text style={styles.username}>@{activeUser.username}</Text>
          {activeUser.bio && <Text style={styles.bio}>{activeUser.bio}</Text>}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/edit-profile")}
            testID="profile-edit-button"
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          {roleAction && (
            <TouchableOpacity
              style={styles.roleActionButton}
              onPress={() => router.push((roleDestination ?? roleAction.route) as any)}
              testID="role-action-button"
            >
              <Text style={styles.roleActionLabel}>{roleAction.label}</Text>
            </TouchableOpacity>
          )}

          {userChannel && (
            <TouchableOpacity
              style={styles.channelButton}
              onPress={() => router.push(`/channel/${userChannel.id}`)}
            >
              <Text style={styles.channelButtonText}>View My Channel</Text>
            </TouchableOpacity>
          )}

          {activeUser.phone && (
            <Text style={styles.phoneText}>{activeUser.phone}</Text>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeUser.subscriptions?.length || 0}</Text>
            <Text style={styles.statLabel}>Subscriptions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeUser.likedVideos?.length || 0}</Text>
            <Text style={styles.statLabel}>Liked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeUser.watchHistory?.length || 0}</Text>
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
                      router.push(item.route as any);
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
  centerContent: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
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
  roleActionButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleActionLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
    color: theme.colors.text,
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
  phoneText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
