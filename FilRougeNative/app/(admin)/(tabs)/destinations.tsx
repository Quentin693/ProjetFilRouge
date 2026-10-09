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
import { DEST_CATEGORY_LABELS } from "@/constants/admin";
import type { AdminDestination } from "@/types";

export default function AdminDestinationsScreen() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await adminService.destinations();
    if (res.data) setDestinations(res.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item: d }: { item: AdminDestination }) => (
    <View style={[styles.card, !d.active && styles.cardInactive]}>
      <Image source={{ uri: d.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {d.name}
            </Text>
            <Text style={styles.country}>📍 {d.country} · {d.continent}</Text>
          </View>
          {!d.active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Inactif</Text>
            </View>
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {DEST_CATEGORY_LABELS[d.category] ?? d.category}
          </Text>
          <Text style={styles.rating}>★ {d.rating.toFixed(1)}</Text>
          <Text style={styles.metaText}>{d.voyagesCount} voyage(s)</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Administration</Text>
        <Text style={styles.pageTitle}>Destinations</Text>
        <Text style={styles.subtitle}>
          {destinations.length} destination{destinations.length > 1 ? "s" : ""}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={destinations}
          keyExtractor={(d) => d.id}
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
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardInactive: { opacity: 0.65 },
  image: { width: 88, height: 88 },
  body: { flex: 1, padding: 12, justifyContent: "center" },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  name: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  country: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  inactiveBadge: {
    backgroundColor: "rgba(248,113,113,0.15)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inactiveText: { color: Colors.error, fontSize: 10, fontWeight: "700" },
  meta: { flexDirection: "row", gap: 10, alignItems: "center" },
  metaText: { fontSize: 11, color: Colors.textSecondary },
  rating: { fontSize: 11, color: Colors.gold, fontWeight: "700" },
});
