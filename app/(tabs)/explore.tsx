import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { Search, TrendingUp, Film, Music, Trophy, Book } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";
import { Video } from "@/types";

const { width } = Dimensions.get("window");

const exploreCategories = [
  { id: "trending", title: "Trending", icon: TrendingUp, color: "#FF2D95" },
  { id: "music", title: "Music", icon: Music, color: "#FF6B6B" },
  { id: "gaming", title: "Gaming", icon: Trophy, color: "#4ECDC4" },
  { id: "education", title: "Education", icon: Book, color: "#95E1D3" },
  { id: "entertainment", title: "Entertainment", icon: Film, color: "#FFE66D" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { videos } = useAppState();
  const [searchQuery, setSearchQuery] = useState("");

  const trendingVideos = [...videos]
    .filter((v) => !v.isShort)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

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

  const renderVideoItem = (item: Video) => (
    <TouchableOpacity
      key={item.id}
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
        <Image source={{ uri: item.channelAvatar }} style={styles.channelAvatar} />
        <View style={styles.videoMeta}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoStats}>
            {item.channelName} • {formatViews(item.views)} views
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.searchContainer}>
          <Search color={theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos, channels..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {exploreCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                  <Icon color="#FFFFFF" size={32} />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          {trendingVideos.map((video) => renderVideoItem(video))}
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
    marginBottom: theme.spacing.md,
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
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  categoryCard: {
    width: (width - theme.spacing.md * 3) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.lg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  categoryTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
