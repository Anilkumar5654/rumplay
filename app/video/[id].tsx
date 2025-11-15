import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TextInput,
  Modal,
  Share as RNShare,
  PanResponder,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Flag,
  Play,
  Pause,
  Volume2,
  Maximize,
  MessageCircle,
  Send,
} from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { defaultVideo } from "@/utils/defaults";
import { Comment } from "@/types";

const { width, height } = Dimensions.get("window");
const PLAYER_HEIGHT = width * (9 / 16);

export default function VideoPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const {
    videos,
    currentUser,
    getVideoById,
    toggleVideoReaction,
    toggleSubscription,
    addToWatchHistory,
    updateVideo,
    settings,
    getWatchPosition,
  } = useAppState();
  const { videoRef, currentVideoId, setCurrentVideoId, minimizePlayer } = usePlayer();

  const videoId = params.id as string;
  const video = getVideoById(videoId) || defaultVideo;

  const [isPlaying, setIsPlaying] = useState(settings.autoPlayOnOpen);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const panY = useRef(new Animated.Value(0)).current;
  const lastSaveTime = useRef(0);

  const addToWatchHistoryRef = useRef<typeof addToWatchHistory>(addToWatchHistory);
  const getWatchPositionRef = useRef<typeof getWatchPosition>(getWatchPosition);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && settings.miniPlayerEnabled;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(panY, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            minimizePlayer();
            router.back();
            panY.setValue(0);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    addToWatchHistoryRef.current = addToWatchHistory;
  }, [addToWatchHistory]);

  useEffect(() => {
    getWatchPositionRef.current = getWatchPosition;
  }, [getWatchPosition]);

  useEffect(() => {
    if (videoId) {
      setCurrentVideoId(videoId);
      addToWatchHistoryRef.current(videoId);

      const savedPosition = getWatchPositionRef.current(videoId);
      if (savedPosition > 0 && videoRef.current) {
        setTimeout(() => {
          videoRef.current?.setPositionAsync(savedPosition);
        }, 500);
      }
    }
  }, [videoId, setCurrentVideoId, videoRef]);

  const userReaction = currentUser.reactions.find((r) => r.videoId === video.id);
  const isSubscribed = currentUser.subscriptions.some((s) => s.channelId === video.channelId);
  const comments = video.comments || [];
  const relatedVideos = videos.filter((v) => v.id !== video.id && !v.isShort).slice(0, 10);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      const now = Date.now();
      if (now - lastSaveTime.current > 5000) {
        lastSaveTime.current = now;
        addToWatchHistoryRef.current(
          videoId,
          status.positionMillis,
          status.durationMillis || 0
        );
      }
    }
  };

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying, videoRef]);

  const handleSeek = useCallback(async (value: number) => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(value);
  }, [videoRef]);

  const handleForward = useCallback(async () => {
    if (!videoRef.current) return;
    const newPosition = Math.min(position + 10000, duration);
    await videoRef.current.setPositionAsync(newPosition);
  }, [position, duration, videoRef]);

  const handleBackward = useCallback(async () => {
    if (!videoRef.current) return;
    const newPosition = Math.max(position - 10000, 0);
    await videoRef.current.setPositionAsync(newPosition);
  }, [position, videoRef]);

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setShowControls(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }
    }, 3000);
  };

  const handlePlayerPress = () => {
    resetControlsTimeout();
  };

  const handleLike = async () => {
    await toggleVideoReaction(video.id, "like");
  };

  const handleDislike = async () => {
    await toggleVideoReaction(video.id, "dislike");
  };

  const handleSubscribe = async () => {
    await toggleSubscription(video.channelId);
  };

  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `Check out this video: ${video.title}`,
        url: `https://playtube.app/video/${video.id}`,
        title: video.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatar,
      text: commentText,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    const updatedComments = [...comments, newComment];
    await updateVideo(video.id, { comments: updatedComments });
    setCommentText("");
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: panY }] }]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.playerContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playerTouchable}
          activeOpacity={1}
          onPress={handlePlayerPress}
        >
          <ExpoVideo
            ref={videoRef}
            source={{ uri: video.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={settings.autoPlayOnOpen}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {showControls && (
            <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
              <View style={styles.centerControls}>
                <TouchableOpacity onPress={handleBackward} style={styles.controlButton}>
                  <Text style={styles.controlButtonText}>-10s</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                  {isPlaying ? (
                    <Pause color="#FFFFFF" size={48} />
                  ) : (
                    <Play color="#FFFFFF" size={48} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForward} style={styles.controlButton}>
                  <Text style={styles.controlButtonText}>+10s</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomControls}>
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>{formatTime(position)}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(position / duration) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.videoInfoSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoStats}>
            {formatViews(video.views)} views • {formatTimeAgo(video.uploadDate)}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, userReaction?.type === "like" && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <ThumbsUp
              color={userReaction?.type === "like" ? theme.colors.primary : theme.colors.text}
              size={24}
              fill={userReaction?.type === "like" ? theme.colors.primary : "none"}
            />
            <Text
              style={[
                styles.actionText,
                userReaction?.type === "like" && styles.actionTextActive,
              ]}
            >
              {formatViews(video.likes)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              userReaction?.type === "dislike" && styles.actionButtonActive,
            ]}
            onPress={handleDislike}
          >
            <ThumbsDown
              color={userReaction?.type === "dislike" ? theme.colors.primary : theme.colors.text}
              size={24}
              fill={userReaction?.type === "dislike" ? theme.colors.primary : "none"}
            />
            <Text
              style={[
                styles.actionText,
                userReaction?.type === "dislike" && styles.actionTextActive,
              ]}
            >
              Dislike
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 color={theme.colors.text} size={24} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowReportModal(true)}>
            <Flag color={theme.colors.text} size={24} />
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.channelSection}>
          <TouchableOpacity
            style={styles.channelInfo}
            onPress={() => router.push(`/channel/${video.channelId}`)}
          >
            <Image source={{ uri: video.channelAvatar }} style={styles.channelAvatar} />
            <View style={styles.channelMeta}>
              <Text style={styles.channelName}>{video.channelName}</Text>
              <Text style={styles.subscriberCount}>2.5M subscribers</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subscribeButton, isSubscribed && styles.subscribedButton]}
            onPress={handleSubscribe}
          >
            <Text
              style={[styles.subscribeText, isSubscribed && styles.subscribedText]}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Text>
          </TouchableOpacity>
        </View>

        {video.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>{video.description}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.commentsHeader}
          onPress={() => setShowComments(!showComments)}
        >
          <MessageCircle color={theme.colors.text} size={24} />
          <Text style={styles.commentsHeaderText}>
            Comments ({comments.length})
          </Text>
        </TouchableOpacity>

        {showComments && (
          <View style={styles.commentsSection}>
            <View style={styles.addCommentContainer}>
              <Image source={{ uri: currentUser.avatar }} style={styles.commentAvatar} />
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity onPress={handleAddComment}>
                <Send color={theme.colors.primary} size={24} />
              </TouchableOpacity>
            </View>

            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{comment.userName}</Text>
                    <Text style={styles.commentTime}>
                      {formatTimeAgo(comment.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Videos</Text>
          {relatedVideos.map((relatedVideo) => (
            <TouchableOpacity
              key={relatedVideo.id}
              style={styles.relatedVideoCard}
              onPress={() => router.push(`/video/${relatedVideo.id}`)}
            >
              <Image
                source={{ uri: relatedVideo.thumbnail }}
                style={styles.relatedThumbnail}
              />
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedTitle} numberOfLines={2}>
                  {relatedVideo.title}
                </Text>
                <Text style={styles.relatedChannel}>{relatedVideo.channelName}</Text>
                <Text style={styles.relatedStats}>
                  {formatViews(relatedVideo.views)} views
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Video</Text>
            <TouchableOpacity style={styles.reportOption}>
              <Text style={styles.reportOptionText}>Spam or misleading</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportOption}>
              <Text style={styles.reportOptionText}>Hateful or abusive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportOption}>
              <Text style={styles.reportOptionText}>Inappropriate content</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  playerContainer: {
    position: "relative" as const,
    backgroundColor: "#000000",
  },
  backButton: {
    position: "absolute" as const,
    top: 50,
    left: theme.spacing.md,
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  playerTouchable: {
    width: "100%",
    height: PLAYER_HEIGHT,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between" as const,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  centerControls: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: theme.spacing.xl,
  },
  controlButton: {
    padding: theme.spacing.md,
  },
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
  },
  playButton: {
    padding: theme.spacing.md,
  },
  bottomControls: {
    padding: theme.spacing.md,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.xs,
  },
  content: {
    flex: 1,
  },
  videoInfoSection: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  videoTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  videoStats: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionButton: {
    alignItems: "center" as const,
    gap: theme.spacing.xs,
  },
  actionButtonActive: {},
  actionText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text,
  },
  actionTextActive: {
    color: theme.colors.primary,
  },
  channelSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  channelInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    flex: 1,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
  },
  channelMeta: {
    flex: 1,
  },
  channelName: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  subscriberCount: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
  },
  subscribedButton: {
    backgroundColor: theme.colors.surface,
  },
  subscribeText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
  },
  subscribedText: {
    color: theme.colors.text,
  },
  descriptionSection: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  description: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  commentsHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentsHeaderText: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  commentsSection: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addCommentContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
  },
  commentInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
  },
  commentItem: {
    flexDirection: "row" as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  commentUserName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  commentTime: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  commentText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  relatedSection: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  relatedVideoCard: {
    flexDirection: "row" as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  relatedThumbnail: {
    width: 160,
    height: 90,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
  },
  relatedInfo: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  relatedChannel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  relatedStats: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  reportOption: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reportOptionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  modalCancel: {
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: "center" as const,
  },
  modalCancelText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
});
