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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Display name is required.");
      return;
    }

    if (!username.trim() || username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert("Error", "Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      setIsSaving(true);
      const apiRoot = getEnvApiRootUrl();
      
      const response = await fetch(`${apiRoot}/user/profile`, {
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
          profile_pic: profilePic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshAuthUser();
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
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
          <TouchableOpacity style={styles.changeAvatarBtn}>
            <Camera color={theme.colors.primary} size={24} />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
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
