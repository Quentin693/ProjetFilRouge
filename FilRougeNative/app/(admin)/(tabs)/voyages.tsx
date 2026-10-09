import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { Colors } from "@/constants/colors";
import { adminService } from "@/services/api";
import { VOYAGE_CATEGORY_LABELS } from "@/constants/admin";
import type { AdminVoyage } from "@/types";

export default function AdminVoyagesScreen() {
  const [voyages, setVoyages] = useState<AdminVoyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await adminService.voyages();
    if (res.data) setVoyages(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item: v }: { item: AdminVoyage }) => (
    <View style={[styles.card, !v.active && styles.cardInactive]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: v.imageUrl }} style={styles.image} />
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {VOYAGE_CATEGORY_LABELS[v.category] ?? v.category}
            </Text>
          </View>
          {v.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.badgeText}>✦ Mis en avant</Text>
            </View>
          )}
        </View>
        {!v.active && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveText}>Inactif</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {v.title}
        </Text>
        <Text style={styles.dest}>
          {v.destination.name}, {v.destination.country}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{v.duration} jours</Text>
          <Text style={styles.meta}>{v.reservationsCount} rés.</Text>
          <Text style={styles.price}>{v.price.toLocaleString("fr-FR")} €</Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Départs actifs</Text>
            <Text style={styles.summaryValue}>{v.activeDepartures}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Places</Text>
            <Text style={styles.summaryValue}>
              {v.bookedSeats}/{v.totalSeats}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remplissage</Text>
            <Text
              style={[
                styles.summaryValue,
                v.fillRate > 80 && { color: Colors.warning },
              ]}
            >
              {v.fillRate}%
            </Text>
          </View>
          {v.nextDeparture && (
            <View style={[styles.summaryRow, styles.summaryLast]}>
              <Text style={styles.summaryLabel}>Prochain départ</Text>
              <Text style={[styles.summaryValue, { color: Colors.gold }]}>
                {new Date(v.nextDeparture).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Administration</Text>
        <Text style={styles.pageTitle}>Gestion des Voyages</Text>
        <Text style={styles.subtitle}>
          {voyages.length} voyage{voyages.length > 1 ? "s" : ""} au total
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={voyages}
          keyExtractor={(v) => v.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun voyage pour le moment.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInactive: { opacity: 0.7, borderColor: "rgba(248,113,113,0.3)" },
  imageWrap: { height: 140, position: "relative" },
  image: { width: "100%", height: "100%" },
  badges: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredBadge: {
    backgroundColor: Colors.goldDim,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: Colors.goldLight, fontSize: 10, fontWeight: "700" },
  inactiveBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(248,113,113,0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inactiveText: { color: Colors.error, fontSize: 10, fontWeight: "700" },
  body: { padding: 14 },
  title: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 4 },
  dest: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  meta: { fontSize: 12, color: Colors.textSecondary },
  price: { fontSize: 13, fontWeight: "700", color: Colors.gold },
  summary: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLast: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryLabel: { fontSize: 12, color: Colors.textMuted },
  summaryValue: { fontSize: 12, fontWeight: "600", color: Colors.textPrimary },
  empty: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
});
