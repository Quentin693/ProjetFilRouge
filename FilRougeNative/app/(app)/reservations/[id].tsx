import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
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

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    reservationService.get(id).then((res) => {
      if (res.data) setReservation(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Réservation introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ Retour</Text>
      </TouchableOpacity>

      {/* Hero image */}
      <Image source={{ uri: reservation.voyage.imageUrl }} style={styles.image} />

      {/* Status */}
      <View style={[styles.statusBar, { borderColor: STATUS_COLORS[reservation.status] }]}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[reservation.status] }]} />
        <Text style={[styles.statusText, { color: STATUS_COLORS[reservation.status] }]}>
          {STATUS_LABELS[reservation.status]}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{reservation.voyage.title}</Text>

      {/* Info cards */}
      <View style={styles.grid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Départ</Text>
          <Text style={styles.infoValue}>
            {new Date(reservation.departure.departureDate).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Retour</Text>
          <Text style={styles.infoValue}>
            {new Date(reservation.departure.returnDate).toLocaleDateString("fr-FR")}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Passagers</Text>
          <Text style={styles.infoValue}>{reservation.passengers.length}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Total payé</Text>
          <Text style={[styles.infoValue, { color: Colors.gold }]}>
            {reservation.totalPrice.toLocaleString("fr-FR")} €
          </Text>
        </View>
      </View>

      {/* Passengers */}
      <Text style={styles.sectionTitle}>Passagers</Text>
      {reservation.passengers.map((p, i) => (
        <View key={i} style={styles.passengerCard}>
          <Text style={styles.passengerName}>
            {p.firstName} {p.lastName}
          </Text>
          <Text style={styles.passengerInfo}>
            Né(e) le {new Date(p.birthDate).toLocaleDateString("fr-FR")}
          </Text>
          <Text style={styles.passengerInfo}>Passeport : {p.passportNumber}</Text>
        </View>
      ))}

      {/* Voucher QR Code */}
      {(reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") && (
        <>
          <Text style={styles.sectionTitle}>Voucher de voyage</Text>
          <TouchableOpacity
            style={styles.qrBanner}
            onPress={() => router.push("/(app)/qr-scan")}
          >
            <Text style={styles.qrBannerIcon}>📱</Text>
            <View style={styles.qrBannerContent}>
              <Text style={styles.qrBannerTitle}>Scanner le QR Code</Text>
              <Text style={styles.qrBannerText}>
                Scannez le QR code depuis le site web pour télécharger votre voucher PDF
              </Text>
            </View>
            <Text style={styles.qrBannerArrow}>›</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { color: Colors.error, fontSize: 16, marginBottom: 12 },
  backLink: { color: Colors.gold },
  backButton: { marginBottom: 16 },
  backText: { color: Colors.gold, fontSize: 16, fontWeight: "600" },
  image: { width: "100%", height: 200, borderRadius: 18, marginBottom: 16 },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginBottom: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: "700", fontSize: 14 },
  title: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  infoCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "700", marginBottom: 6, letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: "700" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  passengerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passengerName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, marginBottom: 6 },
  passengerInfo: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  // QR Banner
  qrBanner: {
    backgroundColor: "rgba(201,168,76,0.07)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  qrBannerIcon: { fontSize: 28 },
  qrBannerContent: { flex: 1 },
  qrBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gold,
    marginBottom: 4,
  },
  qrBannerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  qrBannerArrow: {
    fontSize: 22,
    color: Colors.gold,
    fontWeight: "700",
  },
});
