import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Upload as UploadIcon, Video as VideoIcon, Camera } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";
import { Video, VideoUploadData, UploadProgress } from "@/types";

const CATEGORIES = [
  "Technology",
  "Gaming",
  "Food",
  "Fitness",
  "Music",
  "Education",
  "Entertainment",
  "Sports",
  "Travel",
  "Lifestyle",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function UploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addVideo, currentUser, getChannelById } = useAppState();

  const [uploadData, setUploadData] = useState<Partial<VideoUploadData>>({
    title: "",
    description: "",
    category: "Technology",
    tags: [],
    videoUri: "",
    thumbnailUri: "",
    duration: 0,
    isShort: false,
  });

  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: "idle",
    message: "",
  });

  const [tagInput, setTagInput] = useState("");

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      await Notifications.requestPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert("Permission Required", "Camera and media library permissions are required to upload videos.");
        return false;
      }
      return true;
    }
    return true;
  };

  const generateThumbnail = async (videoUri: string) => {
    try {
      if (Platform.OS === "web") {
        return "https://via.placeholder.com/1280x720/FF2D95/FFFFFF?text=Video+Thumbnail";
      }

      setProgress({
        progress: 20,
        status: "processing",
        message: "Generating thumbnail...",
      });

      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000,
        quality: 0.8,
      });

      return uri;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return "https://via.placeholder.com/1280x720/FF2D95/FFFFFF?text=Video+Thumbnail";
    }
  };

  const getVideoDuration = async (videoUri: string): Promise<number> => {
    return new Promise((resolve) => {
      if (Platform.OS === "web") {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          resolve(video.duration);
        };
        video.onerror = () => resolve(0);
        video.src = videoUri;
      } else {
        resolve(0);
      }
    });
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        console.log("Video picked:", video);

        setProgress({
          progress: 10,
          status: "processing",
          message: "Processing video...",
        });

        const duration = video.duration || (await getVideoDuration(video.uri)) || 0;
        const isShort = duration > 0 && duration < 60;

        const thumbnailUri = await generateThumbnail(video.uri);

        setUploadData({
          ...uploadData,
          videoUri: video.uri,
          thumbnailUri,
          duration,
          isShort,
        });

        setProgress({
          progress: 0,
          status: "idle",
          message: "",
        });

        Alert.alert(
          isShort ? "Short Video Detected" : "Video Ready",
          isShort
            ? "This video is under 60 seconds and will be uploaded as a Short!"
            : "Video is ready to upload."
        );
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video. Please try again.");
      setProgress({
        progress: 0,
        status: "error",
        message: "Failed to pick video",
      });
    }
  };

  const recordVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        console.log("Video recorded:", video);

        setProgress({
          progress: 10,
          status: "processing",
          message: "Processing video...",
        });

        const duration = video.duration || (await getVideoDuration(video.uri)) || 0;
        const isShort = duration > 0 && duration < 60;

        const thumbnailUri = await generateThumbnail(video.uri);

        setUploadData({
          ...uploadData,
          videoUri: video.uri,
          thumbnailUri,
          duration,
          isShort,
        });

        setProgress({
          progress: 0,
          status: "idle",
          message: "",
        });

        Alert.alert(
          isShort ? "Short Video Detected" : "Video Ready",
          isShort
            ? "This video is under 60 seconds and will be uploaded as a Short!"
            : "Video is ready to upload."
        );
      }
    } catch (error) {
      console.error("Error recording video:", error);
      Alert.alert("Error", "Failed to record video. Please try again.");
      setProgress({
        progress: 0,
        status: "error",
        message: "Failed to record video",
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && uploadData.tags && uploadData.tags.length < 10) {
      setUploadData({
        ...uploadData,
        tags: [...uploadData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setUploadData({
      ...uploadData,
      tags: uploadData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const validateUpload = (): boolean => {
    if (!uploadData.videoUri) {
      Alert.alert("Error", "Please select or record a video.");
      return false;
    }

    if (!uploadData.title || uploadData.title.trim().length < 3) {
      Alert.alert("Error", "Please enter a title (minimum 3 characters).");
      return false;
    }

    if (!uploadData.category) {
      Alert.alert("Error", "Please select a category.");
      return false;
    }

    return true;
  };

  const simulateUploadProgress = async () => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress({
        progress: i,
        status: "uploading",
        message: `Uploading... ${i}%`,
      });
    }
  };

  const handleUpload = async () => {
    if (!validateUpload()) return;

    try {
      setProgress({
        progress: 0,
        status: "uploading",
        message: "Starting upload...",
      });

      await simulateUploadProgress();

      const userChannel = currentUser.channelId
        ? getChannelById(currentUser.channelId)
        : null;

      const newVideo: Video = {
        id: `v${Date.now()}`,
        title: uploadData.title || "Untitled Video",
        description: uploadData.description || "",
        thumbnail: uploadData.thumbnailUri || "https://via.placeholder.com/1280x720",
        videoUrl: uploadData.videoUri || "",
        channelId: currentUser.channelId || "ch1",
        channelName: userChannel?.name || currentUser.displayName,
        channelAvatar: userChannel?.avatar || currentUser.avatar,
        views: 0,
        likes: 0,
        dislikes: 0,
        uploadDate: new Date().toISOString(),
        duration: uploadData.duration || 0,
        category: uploadData.category || "General",
        tags: uploadData.tags || [],
        comments: [],
        isShort: uploadData.isShort || false,
        isLive: false,
      };

      await addVideo(newVideo);

      setProgress({
        progress: 100,
        status: "completed",
        message: "Upload completed!",
      });

      if (Platform.OS !== "web") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Upload Complete! 🎉",
            body: `Your ${uploadData.isShort ? "Short" : "video"} "${uploadData.title}" has been uploaded successfully.`,
          },
          trigger: null,
        });
      }

      setTimeout(() => {
        Alert.alert("Success", "Video uploaded successfully!", [
          {
            text: "View Video",
            onPress: () => {
              router.back();
              router.push(`/video/${newVideo.id}`);
            },
          },
          {
            text: "Upload Another",
            onPress: () => {
              setUploadData({
                title: "",
                description: "",
                category: "Technology",
                tags: [],
                videoUri: "",
                thumbnailUri: "",
                duration: 0,
                isShort: false,
              });
              setProgress({
                progress: 0,
                status: "idle",
                message: "",
              });
            },
          },
        ]);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setProgress({
        progress: 0,
        status: "error",
        message: "Upload failed",
      });
      Alert.alert("Error", "Failed to upload video. Please try again.");
    }
  };

  const isUploading = progress.status === "uploading" || progress.status === "processing";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Video</Text>
        <TouchableOpacity onPress={() => router.back()} disabled={isUploading}>
          <X color={theme.colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {uploadData.videoUri ? (
          <View style={styles.videoPreview}>
            <Image source={{ uri: uploadData.thumbnailUri }} style={styles.thumbnail} />
            {uploadData.isShort && (
              <View style={styles.shortBadge}>
                <Text style={styles.shortBadgeText}>SHORT</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.changVideoButton}
              onPress={() => {
                setUploadData({ ...uploadData, videoUri: "", thumbnailUri: "" });
              }}
              disabled={isUploading}
            >
              <Text style={styles.changeVideoText}>Change Video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
              <VideoIcon color={theme.colors.primary} size={48} />
              <Text style={styles.uploadButtonText}>Pick from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={recordVideo}>
              <Camera color={theme.colors.primary} size={48} />
              <Text style={styles.uploadButtonText}>Record Video</Text>
            </TouchableOpacity>
          </View>
        )}

        {uploadData.videoUri && (
          <>
            <View style={styles.formSection}>
              <Text style={styles.label}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter video title"
                placeholderTextColor={theme.colors.textSecondary}
                value={uploadData.title}
                onChangeText={(text) => setUploadData({ ...uploadData, title: text })}
                editable={!isUploading}
                maxLength={100}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter video description"
                placeholderTextColor={theme.colors.textSecondary}
                value={uploadData.description}
                onChangeText={(text) => setUploadData({ ...uploadData, description: text })}
                multiline
                numberOfLines={4}
                editable={!isUploading}
                maxLength={500}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      uploadData.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setUploadData({ ...uploadData, category: cat })}
                    disabled={isUploading}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        uploadData.category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Tags (Optional)</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add tags..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                  editable={!isUploading}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addTag} disabled={isUploading}>
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagsContainer}>
                {uploadData.tags?.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)} disabled={isUploading}>
                      <X color={theme.colors.text} size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {isUploading && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress.message}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.uploadSubmitButton, isUploading && styles.uploadSubmitButtonDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <UploadIcon color="#FFFFFF" size={24} />
                  <Text style={styles.uploadSubmitButtonText}>Upload Video</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
    padding: theme.spacing.md,
  },
  uploadOptions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  uploadButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    alignItems: "center" as const,
    gap: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed" as const,
  },
  uploadButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  videoPreview: {
    position: "relative" as const,
    marginBottom: theme.spacing.xl,
  },
  thumbnail: {
    width: "100%",
    height: 200,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
  },
  shortBadge: {
    position: "absolute" as const,
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
  },
  shortBadgeText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.xs,
    fontWeight: "bold" as const,
  },
  changVideoButton: {
    position: "absolute" as const,
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.overlay,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.lg,
  },
  changeVideoText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top" as const,
  },
  categoriesScroll: {
    marginTop: theme.spacing.sm,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  tagInputContainer: {
    flexDirection: "row" as const,
    gap: theme.spacing.sm,
  },
  tagInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addTagButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center" as const,
    borderRadius: theme.radii.lg,
  },
  addTagButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
  },
  tagsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  tag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  progressSection: {
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.sm,
    overflow: "hidden" as const,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center" as const,
  },
  uploadSubmitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.xl,
  },
  uploadSubmitButtonDisabled: {
    opacity: 0.5,
  },
  uploadSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.md,
    fontWeight: "bold" as const,
  },
});
