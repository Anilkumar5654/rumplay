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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Camera, Check } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAppState } from "@/contexts/AppStateContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, saveCurrentUser, isUsernameUnique } = useAppState();

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState(currentUser.bio);

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

    if (username !== currentUser.username && !isUsernameUnique(username, currentUser.id)) {
      Alert.alert("Error", "This username is already taken.");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      displayName,
      username,
      email,
      bio,
    };
    
    await saveCurrentUser(updatedUser);
    Alert.alert("Success", "Profile updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Check color={theme.colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>Only letters, numbers, and underscores allowed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
