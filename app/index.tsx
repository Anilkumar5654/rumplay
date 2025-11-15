import { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useRootNavigationState } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../constants/theme";

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { isAuthLoading, isAuthenticated, roleDestination } = useAuth();

  const targetRoute = useMemo(() => {
    if (!isAuthenticated) {
      return "/login";
    }

    return roleDestination ?? "/(tabs)/home";
  }, [isAuthenticated, roleDestination]);

  useEffect(() => {
    if (!navigationState?.key || isAuthLoading) {
      return;
    }

    router.replace(targetRoute);
  }, [navigationState?.key, isAuthLoading, router, targetRoute]);

  return (
    <SafeAreaView style={styles.container} testID="index-boot-screen">
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
});
