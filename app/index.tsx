import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)/home");
  }, [router]);

  return <SafeAreaView style={{ flex: 1 }} />;
}
