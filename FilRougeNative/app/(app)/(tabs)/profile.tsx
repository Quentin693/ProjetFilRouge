import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth";

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? "Voyageur"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.role === "ADMIN" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Administrateur</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.card}>
          <ProfileRow icon="👤" label="Nom" value={user?.name ?? "Non renseigné"} />
          <View style={styles.separator} />
          <ProfileRow icon="✉️" label="Email" value={user?.email ?? ""} />
          <View style={styles.separator} />
          <ProfileRow
            icon="🔒"
            label="Rôle"
            value={user?.role === "ADMIN" ? "Administrateur" : "Client"}
          />
        </View>
      </View>

      {user?.role === "ADMIN" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.replace("/(admin)/(tabs)")}
            >
              <Text style={styles.actionIcon}>🛡️</Text>
              <Text style={styles.actionLabel}>Dashboard admin</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation rapide</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/(app)/(tabs)/reservations")}
          >
            <Text style={styles.actionIcon}>✈️</Text>
            <Text style={styles.actionLabel}>Mes réservations</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/(app)/(tabs)/nearby")}
          >
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionLabel}>Destinations proches</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  avatarSection: { alignItems: "center", marginBottom: 36 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.goldDim,
    borderWidth: 2,
    borderColor: Colors.gold,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: Colors.gold },
  name: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textSecondary, marginBottom: 10 },
  adminBadge: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
  },
  adminBadgeText: { color: Colors.error, fontSize: 12, fontWeight: "700" },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600", marginBottom: 2 },
  rowValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: "500" },
  separator: { height: 1, backgroundColor: Colors.border },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  actionIcon: { fontSize: 20 },
  actionLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: "500" },
  chevron: { fontSize: 20, color: Colors.textMuted },
  logoutButton: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    marginTop: 8,
  },
  logoutText: { color: Colors.error, fontWeight: "700", fontSize: 15 },
});
