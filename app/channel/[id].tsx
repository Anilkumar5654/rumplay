import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle, DollarSign } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";
import { defaultChannel } from "@/utils/defaults";

const { width } = Dimensions.get("window");

type TabType = "Videos" | "Shorts" | "About" | "Manage";

export default function ChannelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { channels, videos, currentUser, toggleSubscription, getChannelById } = useAppState();

  const channelId = params.id as string;
  const channel = getChannelById(channelId) || defaultChannel;

  const [selectedTab, setSelectedTab] = useState<TabType>("Videos");

  const isOwnChannel = currentUser.channelId === channelId;
  const isSubscribed = currentUser.subscriptions.some((s) => s.channelId === channelId);

  const channelVideos = videos.filter((v) => v.channelId === channelId && !v.isShort);
  const channelShorts = videos.filter((v) => v.channelId === channelId && v.isShort);

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatSubscribers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(2)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const tabs: TabType[] = isOwnChannel 
    ? ["Videos", "Shorts", "About", "Manage"]
    : ["Videos", "Shorts", "About"];

  const renderVideoGrid = (videoList: typeof videos) => (
    <View style={styles.videoGrid}>
      {videoList.map((video) => (
        <TouchableOpacity
          key={video.id}
          style={styles.gridItem}
          onPress={() => {
            if (video.isShort) {
              router.push(`/shorts/${video.id}`);
            } else {
              router.push(`/video/${video.id}`);
            }
          }}
        >
          <Image source={{ uri: video.thumbnail }} style={styles.gridThumbnail} />
          <Text style={styles.gridTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.gridViews}>{formatViews(video.views)} views</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAbout = () => (
    <View style={styles.aboutSection}>
      <Text style={styles.aboutTitle}>About</Text>
      <Text style={styles.aboutText}>{channel.description || "No description available"}</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatSubscribers(channel.subscriberCount)}</Text>
          <Text style={styles.statLabel}>Subscribers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatViews(channel.totalViews)}</Text>
          <Text style={styles.statLabel}>Total Views</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{channelVideos.length + channelShorts.length}</Text>
          <Text style={styles.statLabel}>Videos</Text>
        </View>
      </View>

      {channel.monetization.enabled && (
        <View style={styles.monetizationBadge}>
          <DollarSign color={theme.colors.success} size={20} />
          <Text style={styles.monetizationText}>Monetization Enabled</Text>
        </View>
      )}
    </View>
  );

  const renderManage = () => {
    if (!isOwnChannel) return null;

    const { monetization } = channel;
    const isEligible = 
      channel.subscriberCount >= monetization.eligibility.minSubscribers &&
      channel.totalWatchHours >= monetization.eligibility.minWatchHours;

    return (
      <View style={styles.manageSection}>
        <Text style={styles.sectionTitle}>Channel Management</Text>

        <View style={styles.manageCard}>
          <Text style={styles.cardTitle}>Monetization</Text>
          {!monetization.enabled ? (
            <>
              <Text style={styles.cardDesc}>Eligibility Requirements:</Text>
              <View style={styles.requirement}>
                <CheckCircle
                  color={
                    channel.subscriberCount >= monetization.eligibility.minSubscribers
                      ? theme.colors.success
                      : theme.colors.textSecondary
                  }
                  size={20}
                />
                <Text style={styles.requirementText}>
                  {formatSubscribers(channel.subscriberCount)} / {formatSubscribers(monetization.eligibility.minSubscribers)} subscribers
                </Text>
              </View>
              <View style={styles.requirement}>
                <CheckCircle
                  color={
                    channel.totalWatchHours >= monetization.eligibility.minWatchHours
                      ? theme.colors.success
                      : theme.colors.textSecondary
                  }
                  size={20}
                />
                <Text style={styles.requirementText}>
                  {channel.totalWatchHours} / {monetization.eligibility.minWatchHours} watch hours
                </Text>
              </View>
              {isEligible && (
                <TouchableOpacity style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Apply for Monetization</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Text style={styles.cardDesc}>Monetization is active</Text>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Total Earnings:</Text>
                <Text style={styles.earningsValue}>
                  ${monetization.earnings.total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Monthly:</Text>
                <Text style={styles.earningsValue}>
                  ${monetization.earnings.monthly.toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Est. RPM:</Text>
                <Text style={styles.earningsValue}>${monetization.estimatedRPM}</Text>
              </View>
            </>
          )}
        </View>

        {monetization.enabled && monetization.membershipTiers.length > 0 && (
          <View style={styles.manageCard}>
            <Text style={styles.cardTitle}>Membership Tiers</Text>
            {monetization.membershipTiers.map((tier) => (
              <View key={tier.id} style={styles.tierItem}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierPrice}>${tier.price}/month</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: channel.banner }} style={styles.banner} />

        <View style={styles.channelHeader}>
          <Image source={{ uri: channel.avatar }} style={styles.avatar} />
          <View style={styles.channelInfo}>
            <View style={styles.channelNameRow}>
              <Text style={styles.channelName}>{channel.name}</Text>
              {channel.verified && (
                <CheckCircle color={theme.colors.primary} size={20} />
              )}
              {channel.monetization.enabled && (
                <DollarSign color={theme.colors.success} size={20} />
              )}
            </View>
            <Text style={styles.subscriberCount}>
              {formatSubscribers(channel.subscriberCount)} subscribers
            </Text>
          </View>
        </View>

        {!isOwnChannel && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]}
              onPress={() => toggleSubscription(channelId)}
            >
              <Text style={[styles.subscribeText, isSubscribed && styles.subscribedText]}>
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTab === "Videos" && renderVideoGrid(channelVideos)}
        {selectedTab === "Shorts" && renderVideoGrid(channelShorts)}
        {selectedTab === "About" && renderAbout()}
        {selectedTab === "Manage" && renderManage()}
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
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  banner: {
    width,
    height: 150,
    backgroundColor: theme.colors.surface,
  },
  channelHeader: {
    flexDirection: "row" as const,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
  },
  channelInfo: {
    flex: 1,
    justifyContent: "center" as const,
  },
  channelNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  channelName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
  },
  subscriberCount: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  actionRow: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subscribeBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
    alignItems: "center" as const,
  },
  subscribedBtn: {
    backgroundColor: theme.colors.surface,
  },
  subscribeText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
  },
  subscribedText: {
    color: theme.colors.text,
  },
  tabsContainer: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center" as const,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: "500" as const,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
  videoGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    padding: theme.spacing.xs,
  },
  gridItem: {
    width: (width - theme.spacing.xs * 2) / 2,
    padding: theme.spacing.xs,
  },
  gridThumbnail: {
    width: "100%",
    height: 120,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  gridTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  gridViews: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  aboutSection: {
    padding: theme.spacing.md,
  },
  aboutTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  aboutText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  monetizationBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
  },
  monetizationText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.success,
    fontWeight: "600" as const,
  },
  manageSection: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  manageCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  cardDesc: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  requirement: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  requirementText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    alignItems: "center" as const,
    marginTop: theme.spacing.md,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
  },
  earningsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  earningsLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  earningsValue: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: "600" as const,
  },
  tierItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tierName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: "600" as const,
  },
  tierPrice: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
});
