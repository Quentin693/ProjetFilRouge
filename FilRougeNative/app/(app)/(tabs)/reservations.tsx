import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { reservationService } from "@/services/api";
import type { Reservation } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.statusPending,
  CONFIRMED: Colors.statusConfirmed,
  CANCELLED: Colors.statusCancelled,
  COMPLETED: Colors.statusCompleted,
};

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    const res = await reservationService.list();
    if (res.data) setReservations(res.data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes voyages</Text>
          <Text style={styles.subtitle}>{reservations.length} réservation(s)</Text>
        </View>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => router.push("/(app)/qr-scan")}
        >
          <Text style={styles.qrButtonText}>📱 QR</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.gold} />
          }
          renderItem={({ item: r }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(app)/reservations/${r.id}`)}
            >
              <Image source={{ uri: r.voyage.imageUrl }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[r.status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[r.status] }]}>
                    {STATUS_LABELS[r.status]}
                  </Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{r.voyage.title}</Text>
                <Text style={styles.dates}>
                  Départ : {new Date(r.departure.departureDate).toLocaleDateString("fr-FR")}
                </Text>
                <Text style={styles.dates}>
                  Retour : {new Date(r.departure.returnDate).toLocaleDateString("fr-FR")}
                </Text>
                <View style={styles.footer}>
                  <Text style={styles.price}>{r.totalPrice.toLocaleString("fr-FR")} €</Text>
                  <Text style={styles.passengers}>
                    {r.passengers.length} passager(s)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✈️</Text>
              <Text style={styles.emptyTitle}>Aucune réservation</Text>
              <Text style={styles.emptyText}>Explorez nos voyages et réservez votre prochaine aventure.</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/(app)/(tabs)/voyages")}
              >
                <Text style={styles.exploreButtonText}>Explorer les voyages</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textMuted },
  qrButton: {
    backgroundColor: "rgba(201,168,76,0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    marginTop: 8,
  },
  qrButtonText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
  list: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: { width: "100%", height: 140 },
  cardBody: { padding: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary, marginBottom: 8 },
  dates: { fontSize: 13, color: Colors.textSecondary, marginBottom: 3 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  price: { fontSize: 18, fontWeight: "800", color: Colors.gold },
  passengers: { fontSize: 12, color: Colors.textMuted },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 22 },
  exploreButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  exploreButtonText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
