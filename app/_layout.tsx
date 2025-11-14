import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerBackTitle: "Back", headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="video/[id]" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="channel/[id]" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="shorts/[id]" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="upload" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="playlist/[id]" options={{ headerShown: false, presentation: "card" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <PlayerProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </PlayerProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}
