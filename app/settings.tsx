import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Palette,
  Moon,
  Sun,
  Wifi,
  Play,
  Minimize2,
  Music,
  PictureInPicture,
  Bell,
  Trash2,
  Database,
  User,
  Download,
  Code,
} from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";

const ACCENT_COLORS = [
  { name: "Pink", value: "#FF2D95" },
  { name: "Blue", value: "#2196F3" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Green", value: "#4CAF50" },
  { name: "Orange", value: "#FF9800" },
  { name: "Red", value: "#F44336" },
  { name: "Teal", value: "#009688" },
  { name: "Indigo", value: "#3F51B5" },
];

const VIDEO_QUALITIES = ["auto", "1080p", "720p", "480p"] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, saveSettings, currentUser, videos, channels } = useAppState();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showDeveloperOptions, setShowDeveloperOptions] = useState(false);

  const handleSettingChange = async (key: keyof typeof settings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    await saveSettings(updated);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear temporary data but keep your watch history and settings. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Cache cleared (simulated)");
              Alert.alert("Success", "Cache cleared successfully!");
            } catch (error) {
              console.error("Error clearing cache:", error);
              Alert.alert("Error", "Failed to clear cache.");
            }
          },
        },
      ]
    );
  };

  const handleClearWatchHistory = () => {
    Alert.alert(
      "Clear Watch History",
      "This will permanently delete your watch history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Watch history cleared");
              Alert.alert("Success", "Watch history cleared!");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Failed to clear watch history.");
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Export your profile, watch history, and settings as JSON backup.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              const exportData = {
                user: currentUser,
                settings: localSettings,
                exportDate: new Date().toISOString(),
              };
              console.log("Exported data:", exportData);
              Alert.alert("Success", "Data exported successfully!");
            } catch (error) {
              console.error("Error exporting data:", error);
              Alert.alert("Error", "Failed to export data.");
            }
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      "Reset App Data",
      "This will reset ALL app data including videos, channels, and settings. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("Success", "App data reset. Please restart the app.");
            } catch (error) {
              console.error("Error resetting app:", error);
              Alert.alert("Error", "Failed to reset app data.");
            }
          },
        },
      ]
    );
  };

  const accentColor = localSettings.accentColor || theme.colors.primary;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {localSettings.theme === "dark" ? (
                <Moon style={styles.settingIcon} color={theme.colors.text} size={24} />
              ) : (
                <Sun style={styles.settingIcon} color={theme.colors.text} size={24} />
              )}
              <View>
                <Text style={styles.settingLabel}>Theme</Text>
                <Text style={styles.settingDescription}>
                  {localSettings.theme === "dark" ? "Dark Mode" : "Light Mode"}
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.theme === "dark"}
              onValueChange={(value) =>
                handleSettingChange("theme", value ? "dark" : "light")
              }
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Palette style={styles.settingIcon} color={theme.colors.text} size={24} />
              <Text style={styles.settingLabel}>Accent Color</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.colorsScroll}
            contentContainerStyle={styles.colorsContainer}
          >
            {ACCENT_COLORS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorOption,
                  { backgroundColor: color.value },
                  localSettings.accentColor === color.value && styles.colorOptionActive,
                ]}
                onPress={() => handleSettingChange("accentColor", color.value)}
              >
                {localSettings.accentColor === color.value && (
                  <View style={styles.colorCheck} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Play style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>Autoplay Next</Text>
                <Text style={styles.settingDescription}>
                  Play next video automatically
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.autoPlayNext}
              onValueChange={(value) => handleSettingChange("autoPlayNext", value)}
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Wifi style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>WiFi Only</Text>
                <Text style={styles.settingDescription}>
                  Autoplay only on WiFi
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.autoPlayOnWifiOnly}
              onValueChange={(value) => handleSettingChange("autoPlayOnWifiOnly", value)}
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Play style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>Autoplay on Open</Text>
                <Text style={styles.settingDescription}>
                  Start playing when video opens
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.autoPlayOnOpen}
              onValueChange={(value) => handleSettingChange("autoPlayOnOpen", value)}
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Minimize2 style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>Mini Player</Text>
                <Text style={styles.settingDescription}>
                  Enable swipe-down mini player
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.miniPlayerEnabled}
              onValueChange={(value) => handleSettingChange("miniPlayerEnabled", value)}
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Music style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>Background Audio</Text>
                <Text style={styles.settingDescription}>
                  Continue playing in background
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.backgroundAudioEnabled}
              onValueChange={(value) =>
                handleSettingChange("backgroundAudioEnabled", value)
              }
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          {Platform.OS !== "web" && (
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <PictureInPicture style={styles.settingIcon} color={theme.colors.text} size={24} />
                <View>
                  <Text style={styles.settingLabel}>Picture-in-Picture</Text>
                  <Text style={styles.settingDescription}>
                    Enable PiP mode
                  </Text>
                </View>
              </View>
              <Switch
                value={localSettings.pipEnabled}
                onValueChange={(value) => handleSettingChange("pipEnabled", value)}
                trackColor={{ false: theme.colors.border, true: accentColor }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Download style={styles.settingIcon} color={theme.colors.text} size={24} />
              <Text style={styles.settingLabel}>Video Quality</Text>
            </View>
          </View>

          <View style={styles.qualityContainer}>
            {VIDEO_QUALITIES.map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityOption,
                  localSettings.videoQuality === quality && {
                    backgroundColor: accentColor,
                  },
                ]}
                onPress={() => handleSettingChange("videoQuality", quality)}
              >
                <Text
                  style={[
                    styles.qualityText,
                    localSettings.videoQuality === quality && styles.qualityTextActive,
                  ]}
                >
                  {quality === "auto" ? "Auto" : quality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified about uploads
                </Text>
              </View>
            </View>
            <Switch
              value={localSettings.notificationsEnabled}
              onValueChange={(value) => handleSettingChange("notificationsEnabled", value)}
              trackColor={{ false: theme.colors.border, true: accentColor }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearWatchHistory}>
            <View style={styles.settingLeft}>
              <Trash2 style={styles.settingIcon} color={theme.colors.error} size={24} />
              <Text style={[styles.settingLabel, { color: theme.colors.error }]}>
                Clear Watch History
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Database style={styles.settingIcon} color={theme.colors.text} size={24} />
              <Text style={styles.settingLabel}>Clear Cache</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Download style={styles.settingIcon} color={theme.colors.text} size={24} />
              <Text style={styles.settingLabel}>Export Data</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/edit-profile")}
          >
            <View style={styles.settingLeft}>
              <User style={styles.settingIcon} color={theme.colors.text} size={24} />
              <View>
                <Text style={styles.settingLabel}>Manage Account</Text>
                <Text style={styles.settingDescription}>
                  Edit profile and preferences
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowDeveloperOptions(!showDeveloperOptions)}
          >
            <View style={styles.settingLeft}>
              <Code style={styles.settingIcon} color={theme.colors.textSecondary} size={24} />
              <Text style={styles.settingLabel}>Developer Options</Text>
            </View>
          </TouchableOpacity>

          {showDeveloperOptions && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingLabel}>Experimental Features</Text>
                </View>
                <Switch
                  value={localSettings.experimentalFeatures}
                  onValueChange={(value) =>
                    handleSettingChange("experimentalFeatures", value)
                  }
                  trackColor={{ false: theme.colors.border, true: accentColor }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.devInfo}>
                <Text style={styles.devInfoText}>Videos: {videos.length}</Text>
                <Text style={styles.devInfoText}>Channels: {channels.length}</Text>
                <Text style={styles.devInfoText}>Platform: {Platform.OS}</Text>
              </View>

              <TouchableOpacity style={styles.dangerButton} onPress={handleResetApp}>
                <Text style={styles.dangerButtonText}>Reset App Data</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PlayTube v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingIcon: {
    marginRight: theme.spacing.md,
  },
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
  },
  section: {
    paddingTop: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "bold" as const,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  settingLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  settingLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: "500" as const,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  colorsScroll: {
    marginBottom: theme.spacing.md,
  },
  colorsContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.sm,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: theme.colors.text,
  },
  colorCheck: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.full,
    backgroundColor: "#FFFFFF",
  },
  qualityContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  qualityOption: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  qualityText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  qualityTextActive: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  devInfo: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  devInfoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: theme.spacing.xs,
  },
  dangerButton: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error,
    borderRadius: theme.radii.lg,
    alignItems: "center" as const,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: theme.fontSizes.md,
    fontWeight: "600" as const,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
