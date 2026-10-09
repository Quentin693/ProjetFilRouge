import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth";

export default function AdminMoreScreen() {
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Administration</Text>
      <Text style={styles.title}>Plus</Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Administrateur</Text>
        </View>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/(admin)/users")}
        >
          <Text style={styles.rowIcon}>👥</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Utilisateurs</Text>
            <Text style={styles.rowHint}>Comptes, rôles, dépenses</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/(admin)/stats")}
        >
          <Text style={styles.rowIcon}>📊</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Statistiques</Text>
            <Text style={styles.rowHint}>KPI, tops, activité 7j</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.switchBtn}
        onPress={() => router.replace("/(app)/(tabs)")}
      >
        <Text style={styles.switchText}>← Espace voyageur</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(248,113,113,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: Colors.error, fontWeight: "800", fontSize: 16 },
  userName: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  userRole: { fontSize: 12, color: Colors.error, marginTop: 2 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: "600" },
  rowHint: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.border },
  switchBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  switchText: { color: Colors.textSecondary, fontWeight: "600", fontSize: 15 },
  logoutButton: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
  },
  logoutText: { color: Colors.error, fontWeight: "700", fontSize: 15 },
});
