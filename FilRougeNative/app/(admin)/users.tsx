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
  Alert,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { adminService } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import type { AdminUser } from "@/types";

export default function AdminUsersScreen() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    const res = await adminService.users(q);
    if (res.data) setUsers(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleRole = async (u: AdminUser) => {
    if (u.id === me?.id) {
      Alert.alert("Action impossible", "Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    const nextRole = u.role === "ADMIN" ? "Utilisateur" : "Administrateur";
    Alert.alert(
      u.role === "ADMIN" ? "Rétrograder" : "Promouvoir",
      `Passer ${u.name ?? u.email} en ${nextRole} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            setActingId(u.id);
            const res = await adminService.toggleUserRole(u.id);
            if (res.data) {
              setUsers((prev) =>
                prev.map((user) =>
                  user.id === u.id
                    ? { ...user, role: res.data!.role as "ADMIN" | "USER" }
                    : user
                )
              );
            } else {
              Alert.alert("Erreur", res.error ?? "Action impossible.");
            }
            setActingId(null);
          },
        },
      ]
    );
  };

  const handleDelete = async (u: AdminUser) => {
    if (u.id === me?.id) {
      Alert.alert(
        "Action impossible",
        "Vous ne pouvez pas supprimer votre propre compte."
      );
      return;
    }
    Alert.alert(
      "Supprimer l'utilisateur",
      `Supprimer définitivement ${u.name ?? u.email} et toutes ses données ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setActingId(u.id);
            const res = await adminService.deleteUser(u.id);
            if (res.data?.success) {
              setUsers((prev) => prev.filter((user) => user.id !== u.id));
            } else {
              Alert.alert("Erreur", res.error ?? "Action impossible.");
            }
            setActingId(null);
          },
        },
      ]
    );
  };

  const renderItem = ({ item: u }: { item: AdminUser }) => {
    const initials = u.name
      ? u.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

    const isSelf = u.id === me?.id;
    const isActing = actingId === u.id;

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
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {u.name ?? "Sans nom"}
            </Text>
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

          <Text style={styles.email} numberOfLines={1}>
            {u.email}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {u.reservationsCount} rés. · {u.totalSpent.toLocaleString("fr-FR")} €
            </Text>
            <Text style={styles.date}>
              {new Date(u.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>

          {/* Actions */}
          {!isSelf && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  u.role === "ADMIN" ? styles.btnDemote : styles.btnPromote,
                  isActing && styles.btnDisabled,
                ]}
                onPress={() => handleToggleRole(u)}
                disabled={isActing}
                activeOpacity={0.7}
              >
                {isActing ? (
                  <ActivityIndicator
                    size="small"
                    color={u.role === "ADMIN" ? Colors.warning : Colors.info}
                  />
                ) : (
                  <Text
                    style={[
                      styles.actionBtnText,
                      {
                        color:
                          u.role === "ADMIN" ? Colors.warning : Colors.info,
                      },
                    ]}
                  >
                    {u.role === "ADMIN" ? "⬇ Rétrograder" : "⬆ Promouvoir"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.btnDelete, isActing && styles.btnDisabled]}
                onPress={() => handleDelete(u)}
                disabled={isActing}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionBtnText, { color: Colors.error }]}>
                  🗑 Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isSelf && (
            <Text style={styles.selfNote}>← Votre compte</Text>
          )}
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
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun utilisateur trouvé.</Text>
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
    alignItems: "flex-start",
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  email: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaText: { fontSize: 11, color: Colors.textMuted },
  date: { fontSize: 11, color: Colors.textMuted },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleAdmin: { backgroundColor: "rgba(248,113,113,0.12)" },
  roleUser: { backgroundColor: "rgba(96,165,250,0.12)" },
  roleText: { fontSize: 10, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 32,
  },
  btnPromote: {
    backgroundColor: "rgba(96,165,250,0.08)",
    borderColor: "rgba(96,165,250,0.25)",
  },
  btnDemote: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.25)",
  },
  btnDelete: {
    backgroundColor: "rgba(248,113,113,0.08)",
    borderColor: "rgba(248,113,113,0.25)",
  },
  btnDisabled: { opacity: 0.5 },
  actionBtnText: { fontSize: 11, fontWeight: "700" },
  selfNote: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginTop: 4,
  },
  empty: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
});
