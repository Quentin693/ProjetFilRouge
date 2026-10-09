import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { adminService } from "@/services/api";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/constants/admin";
import type { AdminStats } from "@/types";

const MEDALS = ["🥇", "🥈", "🥉", "🏅", "🏅"];

export default function AdminStatsScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await adminService.stats();
    if (res.data) setStats(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  const totalResCount = stats.byStatus.reduce((s, b) => s + b.count, 0) || 1;
  const confirmed = stats.byStatus.find((b) => b.status === "CONFIRMED")?.count ?? 0;
  const confirmRate = Math.round((confirmed / totalResCount) * 100);
  const totalCat = stats.byCategory.reduce((s, b) => s + b.count, 0) || 1;

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
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Retour</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Statistiques</Text>
      <Text style={styles.subtitle}>Vue globale de l'activité de la plateforme</Text>

      <View style={styles.grid}>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Revenu total</Text>
          <Text style={[styles.kpiValue, { color: Colors.gold }]}>
            {stats.totalRevenue.toLocaleString("fr-FR")} €
          </Text>
          <Text style={styles.kpiSub}>
            vs mois dernier {stats.revenueGrowth >= 0 ? "+" : ""}
            {stats.revenueGrowth}%
          </Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Utilisateurs</Text>
          <Text style={[styles.kpiValue, { color: Colors.info }]}>{stats.totalUsers}</Text>
          <Text style={styles.kpiSub}>+{stats.newUsersThisMonth} ce mois</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Réservations</Text>
          <Text style={[styles.kpiValue, { color: Colors.success }]}>
            {stats.totalReservations}
          </Text>
          <Text style={styles.kpiSub}>+{stats.reservationsThisMonth} ce mois</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiLabel}>Taux de confirmation</Text>
          <Text style={[styles.kpiValue, { color: "#C084FC" }]}>{confirmRate}%</Text>
          <Text style={styles.kpiSub}>
            {confirmed} / {stats.totalReservations}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Répartition des réservations</Text>
        {[...stats.byStatus]
          .sort((a, b) => b.count - a.count)
          .map((item) => {
            const pct = Math.round((item.count / totalResCount) * 100);
            return (
              <View key={item.status} style={styles.barBlock}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                  <Text style={styles.barCount}>
                    {item.count}{" "}
                    <Text style={styles.barPct}>({pct}%)</Text>
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[item.status] ?? Colors.textMuted,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Voyages par catégorie</Text>
        {[...stats.byCategory]
          .sort((a, b) => b.count - a.count)
          .map((item) => {
            const pct = Math.round((item.count / totalCat) * 100);
            return (
              <View key={item.category} style={styles.barBlock}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Text>
                  <Text style={styles.barCount}>
                    {item.count}{" "}
                    <Text style={styles.barPct}>({pct}%)</Text>
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%`, backgroundColor: Colors.gold },
                    ]}
                  />
                </View>
              </View>
            );
          })}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🏆 Top voyages</Text>
        {stats.topVoyages.map((v, i) => (
          <View key={v.id} style={styles.rankRow}>
            <View style={[styles.rankBadge, i === 0 && styles.rankGold]}>
              <Text style={[styles.rankNum, i === 0 && { color: "#000" }]}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankTitle} numberOfLines={1}>
                {v.title}
              </Text>
              <Text style={styles.rankSub}>{v.destination}</Text>
            </View>
            <Text style={styles.rankValue}>{v.reservations} rés.</Text>
          </View>
        ))}
        {stats.topVoyages.length === 0 && (
          <Text style={styles.empty}>Aucune donnée</Text>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>⚡ Activité récente (7j)</Text>
        {stats.recentActivity.map((res) => (
          <View key={res.id} style={styles.activityRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankTitle} numberOfLines={1}>
                {res.userName ?? "Client"}
              </Text>
              <Text style={styles.rankSub} numberOfLines={1}>
                {res.voyageTitle}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.rankValue}>
                {res.totalPrice.toLocaleString("fr-FR")} €
              </Text>
              <Text style={styles.rankSub}>
                {new Date(res.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          </View>
        ))}
        {stats.recentActivity.length === 0 && (
          <Text style={styles.empty}>Aucune activité cette semaine</Text>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🌍 Top destinations</Text>
        <View style={styles.destGrid}>
          {stats.topDestinations.map((dest, i) => (
            <View key={dest.id} style={styles.destCard}>
              <Text style={styles.medal}>{MEDALS[i] ?? "🏅"}</Text>
              <Text style={styles.destName} numberOfLines={1}>
                {dest.name}
              </Text>
              <Text style={styles.destCount}>{dest.voyages} voyage(s)</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  back: { marginBottom: 12 },
  backText: { color: Colors.gold, fontSize: 15, fontWeight: "600" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  kpi: {
    width: "47.5%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kpiLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  kpiValue: { fontSize: 20, fontWeight: "800" },
  kpiSub: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  panel: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  barBlock: { marginBottom: 12 },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barLabel: { fontSize: 13, color: Colors.textSecondary },
  barCount: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  barPct: { fontWeight: "400", color: Colors.textMuted },
  barTrack: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  rankGold: { backgroundColor: Colors.gold },
  rankNum: { fontSize: 11, fontWeight: "800", color: Colors.textSecondary },
  rankTitle: { fontSize: 13, fontWeight: "600", color: Colors.textPrimary },
  rankSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  rankValue: { fontSize: 13, fontWeight: "700", color: Colors.gold },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  destGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  destCard: {
    width: "31%",
    flexGrow: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medal: { fontSize: 22, marginBottom: 6 },
  destName: { fontSize: 12, fontWeight: "600", color: Colors.textPrimary },
  destCount: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  empty: { color: Colors.textMuted, textAlign: "center", paddingVertical: 12 },
});
