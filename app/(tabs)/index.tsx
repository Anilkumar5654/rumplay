import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";

import { Search, Mic, Plus } from "lucide-react-native";
import UploadModal from "@/components/UploadModal";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";
import { categories } from "@/mocks/data";
import { Video } from "@/types";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { videos, currentUser } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const shorts = videos.filter((v) => v.isShort);
  const regularVideos = videos.filter((v) => !v.isShort);

  const filteredVideos =
    selectedCategory === "All"
      ? regularVideos
      : regularVideos.filter((v) => v.category === selectedCategory);

  const subscribedChannelIds = currentUser.subscriptions.map((s) => s.channelId);
  const recommendedVideos = filteredVideos;

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const renderShortItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.shortCard}
      onPress={() => router.push(`/shorts/${item.id}`)}
    >
      <View style={styles.shortThumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.shortThumbnail} />
        <View style={styles.shortBadge}>
          <Text style={styles.shortBadgeText}>SHORT</Text>
        </View>
      </View>
      <Text style={styles.shortTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.shortViews}>{formatViews(item.views)} views</Text>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Image
          source={{ uri: item.channelAvatar }}
          style={styles.channelAvatar}
        />
        <View style={styles.videoMeta}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoStats}>
            {item.channelName} • {formatViews(item.views)} views • {formatTimeAgo(item.uploadDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>PlayTube</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setUploadModalVisible(true)}
          >
            <Plus color={theme.colors.primary} size={24} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push('/search')}
        >
          <Search color={theme.colors.textSecondary} size={20} />
          <Text style={styles.searchPlaceholder}>Search</Text>
          <Mic color={theme.colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {shorts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shorts</Text>
            <FlatList
              horizontal
              data={shorts}
              renderItem={renderShortItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shortsContainer}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended</Text>
          {recommendedVideos.map((video) => (
            <View key={video.id}>{renderVideoItem({ item: video })}</View>
          ))}
        </View>
      </ScrollView>

      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUploadComplete={() => {
          setUploadModalVisible(false);
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: theme.spacing.sm,
  },
  logo: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
  },
  categories: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: "500" as const,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  shortsContainer: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  shortCard: {
    width: 140,
  },
  shortThumbnailContainer: {
    position: "relative" as const,
  },
  shortThumbnail: {
    width: 140,
    height: 240,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
  shortBadge: {
    position: "absolute" as const,
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radii.sm,
  },
  shortBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold" as const,
    letterSpacing: 0.5,
  },
  shortTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    fontWeight: "500" as const,
    marginTop: theme.spacing.sm,
  },
  shortViews: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.xs,
    marginTop: 2,
  },
  videoCard: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  thumbnailContainer: {
    position: "relative" as const,
  },
  videoThumbnail: {
    width: "100%",
    height: (width - theme.spacing.md * 2) * (9 / 16),
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
  durationBadge: {
    position: "absolute" as const,
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.xs,
    fontWeight: "600" as const,
  },
  videoInfo: {
    flexDirection: "row" as const,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  channelAvatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
  },
  videoMeta: {
    flex: 1,
  },
  videoTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
    lineHeight: 20,
  },
  videoStats: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.xs,
    marginTop: 4,
  },
});
