import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/colors";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    if (user?.role === "ADMIN") {
      return <Redirect href="/(admin)/(tabs)" />;
    }
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
