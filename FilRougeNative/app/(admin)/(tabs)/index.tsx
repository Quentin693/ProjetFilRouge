import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { Colors } from "@/constants/colors";
import { adminService } from "@/services/api";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/admin";
import type { AdminOverview } from "@/types";

export default function AdminOverviewScreen() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await adminService.overview();
    if (res.data) setData(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = data
    ? [
        { title: "Utilisateurs", value: String(data.totalUsers), color: Colors.info },
        { title: "Réservations", value: String(data.totalReservations), color: Colors.success },
        { title: "Voyages", value: String(data.totalVoyages), color: Colors.gold },
        {
          title: "Revenu total",
          value: `${data.totalRevenue.toLocaleString("fr-FR")} €`,
          color: "#C084FC",
        },
      ]
    : [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={Colors.gold}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.kicker}>Administration — Voyage Luxe</Text>
        <Text style={styles.title}>Vue d'ensemble</Text>
        <Text style={styles.subtitle}>
          {data?.pendingReservations ?? 0} réservation(s) en attente de confirmation
        </Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.title} style={styles.statCard}>
            <Text style={styles.statLabel}>{card.title}</Text>
            <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Réservations récentes</Text>
      <View style={styles.table}>
        {data?.recentReservations.length === 0 && (
          <Text style={styles.empty}>Aucune réservation récente</Text>
        )}
        {data?.recentReservations.map((res) => (
          <View key={res.id} style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.rowName} numberOfLines={1}>
                {res.user.name ?? "Client"}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {res.voyage.title}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowPrice}>
                {res.totalPrice.toLocaleString("fr-FR")} €
              </Text>
              <Text
                style={[
                  styles.rowStatus,
                  { color: STATUS_COLORS[res.status] ?? Colors.textMuted },
                ]}
              >
                {STATUS_LABELS[res.status] ?? res.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: "47.5%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  table: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  empty: {
    color: Colors.textMuted,
    textAlign: "center",
    padding: 24,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowMain: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 3 },
  rowMeta: { fontSize: 12, color: Colors.textSecondary },
  rowRight: { alignItems: "flex-end" },
  rowPrice: { fontSize: 14, fontWeight: "700", color: Colors.gold, marginBottom: 3 },
  rowStatus: { fontSize: 11, fontWeight: "600" },
});
