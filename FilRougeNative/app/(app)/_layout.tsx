import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/colors";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="voyages/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="reservations/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="qr-scan" options={{ presentation: "modal" }} />
    </Stack>
  );
}
