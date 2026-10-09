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
import { useCallback, useEffect, useRef, useState } from "react";
import { Colors } from "@/constants/colors";
import { adminService } from "@/services/api";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/admin";
import type { AdminReservation, AdminReservationsPayload } from "@/types";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED"];

const FILTER_LABELS: Record<string, string> = {
  ALL: "Toutes",
  ...STATUS_LABELS,
};

export default function AdminReservationsScreen() {
  const [payload, setPayload] = useState<AdminReservationsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const searchRef = useRef<TextInput>(null);

  const load = useCallback(
    async (currentStatus?: string, currentSearch?: string) => {
      const res = await adminService.reservations({
        status: currentStatus ?? status,
        search: (currentSearch !== undefined ? currentSearch : search).trim() || undefined,
      });
      if (res.data) setPayload(res.data);
      setLoading(false);
      setRefreshing(false);
    },
    [status, search]
  );

  useEffect(() => {
    setLoading(true);
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const countFor = (key: string) => {
    if (!payload) return 0;
    if (key === "ALL") return payload.total;
    return payload.counts[key] ?? 0;
  };

  const renderItem = ({ item: r }: { item: AdminReservation }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.ref}>#{r.reference.slice(-8).toUpperCase()}</Text>
        <Text style={[styles.status, { color: STATUS_COLORS[r.status] ?? Colors.textMuted }]}>
          {STATUS_LABELS[r.status] ?? r.status}
        </Text>
      </View>
      <Text style={styles.client} numberOfLines={1}>
        {r.user.name ?? "Client"} · {r.user.email}
      </Text>
      <Text style={styles.voyage} numberOfLines={1}>
        {r.voyage.title}
      </Text>
      <View style={styles.cardBottom}>
        <Text style={styles.meta}>
          {new Date(r.departure.departureDate).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}{" "}
          · {r.adults + r.children} voyageur{r.adults + r.children > 1 ? "s" : ""}
        </Text>
        <Text style={styles.price}>{r.totalPrice.toLocaleString("fr-FR")} €</Text>
      </View>
      {r.paymentStatus && (
        <Text style={styles.payment}>Paiement : {r.paymentStatus}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.kicker}>Administration</Text>
        <Text style={styles.pageTitle}>Toutes les Réservations</Text>
        <Text style={styles.subtitle}>
          {payload?.total ?? 0} réservation(s) au total
        </Text>

        <View style={styles.searchBox}>
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => load(status, search)}
            placeholder="Référence, client, voyage…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(i) => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, status === item && styles.chipActive]}
            onPress={() => setStatus(item)}
          >
            <Text style={[styles.chipText, status === item && styles.chipTextActive]}>
              {FILTER_LABELS[item]} ({countFor(item)})
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={payload?.reservations ?? []}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.empty}>Aucune réservation pour ce filtre.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 8,
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
    fontSize: 24,
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
  filtersList: { flexGrow: 0, maxHeight: 52 },
  filters: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { color: Colors.textSecondary, fontSize: 11, fontWeight: "600" },
  chipTextActive: { color: "#000" },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ref: { fontSize: 11, color: Colors.textMuted, fontWeight: "700", letterSpacing: 0.5 },
  status: { fontSize: 11, fontWeight: "700" },
  client: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 3 },
  voyage: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 12, color: Colors.textMuted },
  price: { fontSize: 15, fontWeight: "800", color: Colors.gold },
  payment: { fontSize: 11, color: Colors.textMuted, marginTop: 8 },
  empty: { color: Colors.textMuted, textAlign: "center", marginTop: 40 },
});
