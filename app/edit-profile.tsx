import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import type { ImagePickerAsset } from "expo-image-picker";
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { getEnvApiRootUrl } from "@/utils/env";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { authUser, authToken, refreshAuthUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (authUser) {
      setDisplayName(authUser.displayName || "");
      setUsername(authUser.username || "");
      setEmail(authUser.email || "");
      setBio(authUser.bio || "");
      setPhone(authUser.phone || "");
      setProfilePic(authUser.avatar || "");
      setIsLoading(false);
    }
  }, [authUser]);

  const pickProfilePicture = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Please allow access to your photo library.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0] as ImagePickerAsset;
        await uploadProfilePicture(asset.uri);
      }
    } catch (error) {
      console.error("Error picking profile picture:", error);
      Alert.alert("Error", "Failed to pick profile picture. Please try again.");
    }
  };

  const uploadProfilePicture = async (uri: string) => {
    try {
      setUploadingAvatar(true);
      const apiRoot = getEnvApiRootUrl();

      const inferExtension = (fileUri: string): string => {
        const sanitized = fileUri.split("?")[0];
        const segment = sanitized.split("/").pop() ?? "";
        const ext = segment.split(".").pop();
        return ext ? ext.toLowerCase() : "jpg";
      };

      const extension = inferExtension(uri);
      const fileName = `profile-${Date.now()}.${extension}`;
      const mimeType = extension === "png" ? "image/png" : "image/jpeg";

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: mimeType });
        formData.append("profile_pic", file as any);
      } else {
        formData.append("profile_pic", {
          uri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      const response = await fetch(`${apiRoot}/user/profile/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log("Profile upload response status:", response.status);
      console.log("Profile upload response text:", responseText);

      if (!response.ok) {
        throw new Error(`Server error (${response.status}): ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("Invalid response from server. Please check your API endpoint.");
      }

      if (data.success && data.profile_pic_url) {
        const apiBaseUrl = apiRoot.replace('/api', '');
        const fullProfilePicUrl = data.profile_pic_url.startsWith('http') 
          ? data.profile_pic_url 
          : `${apiBaseUrl}${data.profile_pic_url}`;
        
        console.log("Setting profile pic to:", fullProfilePicUrl);
        setProfilePic(fullProfilePicUrl);
        
        const refreshResult = await refreshAuthUser();
        console.log("Auth refresh result:", refreshResult);
        
        Alert.alert("Success", "Profile picture updated successfully!");
      } else {
        Alert.alert("Error", data.error || "Failed to upload profile picture.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Upload Error", errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required.");
      return;
    }

    try {
      setIsSaving(true);
      const apiRoot = getEnvApiRootUrl();
      
      console.log("Saving profile with data:", {
        name: displayName,
        bio: bio,
        phone: phone,
      });
      
      const response = await fetch(`${apiRoot}/user/update`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: displayName,
          bio: bio,
          phone: phone,
        }),
      });

      const responseText = await response.text();
      console.log("Update profile response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse update response:", responseText);
        throw new Error("Invalid response from server");
      }

      if (data.success) {
        const refreshResult = await refreshAuthUser();
        console.log("Auth refresh after update:", refreshResult);
        
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update profile: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Check color={theme.colors.primary} size={24} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <Image 
            source={{ uri: profilePic || authUser?.avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=profile" }} 
            style={styles.avatar} 
          />
          <TouchableOpacity 
            style={styles.changeAvatarBtn} 
            onPress={pickProfilePicture}
            disabled={uploadingAvatar || isSaving}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Camera color={theme.colors.primary} size={24} />
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter display name"
              placeholderTextColor={theme.colors.textSecondary}
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={username}
              placeholder="Username"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helperText}>Username cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="phone-pad"
              editable={!isSaving}
            />
          </View>
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600" as const,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center" as const,
    paddingVertical: theme.spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  changeAvatarBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: theme.spacing.xs,
  },
  changeAvatarText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: "600" as const,
  },
  form: {
    padding: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600" as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  disabledInput: {
    opacity: 0.6,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top" as const,
  },
  helperText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
