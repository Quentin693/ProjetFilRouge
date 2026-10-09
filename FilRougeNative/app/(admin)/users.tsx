import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { adminService } from "@/services/api";
import type { AdminUser } from "@/types";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async (q?: string) => {
    const res = await adminService.users(q);
    if (res.data) setUsers(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item: u }: { item: AdminUser }) => {
    const initials = u.name
      ? u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.avatar,
            u.role === "ADMIN" && styles.avatarAdmin,
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              u.role === "ADMIN" && { color: Colors.error },
            ]}
          >
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {u.name ?? "Sans nom"}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {u.email}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {u.reservationsCount} rés. · {u.totalSpent.toLocaleString("fr-FR")} €
            </Text>
            <Text style={styles.date}>
              {new Date(u.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.roleBadge,
            u.role === "ADMIN" ? styles.roleAdmin : styles.roleUser,
          ]}
        >
          <Text
            style={[
              styles.roleText,
              { color: u.role === "ADMIN" ? Colors.error : Colors.info },
            ]}
          >
            {u.role === "ADMIN" ? "Admin" : "Client"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Utilisateurs</Text>
        <Text style={styles.subtitle}>{users.length} compte(s) inscrit(s)</Text>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => load(search.trim() || undefined)}
            placeholder="Rechercher par nom ou email…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(search.trim() || undefined);
              }}
              tintColor={Colors.gold}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  back: { marginBottom: 12 },
  backText: { color: Colors.gold, fontSize: 15, fontWeight: "600" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 14 },
  searchBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  searchInput: { color: Colors.textPrimary, fontSize: 14, padding: 0 },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldDim,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarAdmin: { backgroundColor: "rgba(248,113,113,0.15)" },
  avatarText: { color: Colors.gold, fontWeight: "800", fontSize: 14 },
  name: { fontSize: 14, fontWeight: "700", color: Colors.textPrimary },
  email: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  metaText: { fontSize: 11, color: Colors.textMuted },
  date: { fontSize: 11, color: Colors.textMuted },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleAdmin: { backgroundColor: "rgba(248,113,113,0.12)" },
  roleUser: { backgroundColor: "rgba(96,165,250,0.12)" },
  roleText: { fontSize: 10, fontWeight: "700" },
});
