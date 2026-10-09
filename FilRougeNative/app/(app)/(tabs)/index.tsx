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
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth";
import { voyageService } from "@/services/api";
import type { Voyage } from "@/types";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [featured, setFeatured] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    voyageService.list().then((res) => {
      if (res.data) setFeatured(res.data.slice(0, 4));
      setLoading(false);
    });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{user?.name ?? "Voyageur"}</Text>
        </View>
      </View>

      {user?.role === "ADMIN" && (
        <TouchableOpacity
          style={styles.adminBanner}
          onPress={() => router.replace("/(admin)/(tabs)")}
          activeOpacity={0.85}
        >
          <Text style={styles.adminBannerTitle}>🛡️ Dashboard admin</Text>
          <Text style={styles.adminBannerText}>Gérer voyages, réservations et stats</Text>
        </TouchableOpacity>
      )}

      {/* Hero banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Votre prochain{"\n"}voyage vous attend</Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => router.push("/(app)/(tabs)/voyages")}
        >
          <Text style={styles.heroButtonText}>Explorer</Text>
        </TouchableOpacity>
      </View>

      {/* Featured voyages */}
      <Text style={styles.sectionTitle}>Voyages populaires</Text>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
          {featured.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.card}
              onPress={() => router.push(`/(app)/voyages/${v.id}`)}
            >
              <Image source={{ uri: v.imageUrl }} style={styles.cardImage} />
              <View style={styles.cardOverlay}>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{v.category}</Text>
                </View>
                <View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{v.title}</Text>
                  <Text style={styles.cardMeta}>
                    {v.destination.country} • {v.duration}j
                  </Text>
                  <Text style={styles.cardPrice}>
                    À partir de{" "}
                    <Text style={styles.cardPriceValue}>
                      {v.price.toLocaleString("fr-FR")} €
                    </Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(app)/(tabs)/reservations")}
        >
          <Text style={styles.actionIcon}>✈️</Text>
          <Text style={styles.actionLabel}>Mes réservations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(app)/(tabs)/nearby")}
        >
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionLabel}>Destinations proches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(app)/qr-scan")}
        >
          <Text style={styles.actionIcon}>📱</Text>
          <Text style={styles.actionLabel}>Scanner QR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  name: { fontSize: 22, fontWeight: "700", color: Colors.textPrimary, marginTop: 2 },
  adminBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.35)",
  },
  adminBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  adminBannerText: { fontSize: 12, color: Colors.textMuted },
  heroBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.goldDim,
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 20,
    lineHeight: 34,
  },
  heroButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "flex-start",
  },
  heroButtonText: { color: "#000", fontWeight: "700", fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
    marginTop: 4,
  },
  horizontal: { marginHorizontal: -20, paddingLeft: 20, marginBottom: 32 },
  card: {
    width: 240,
    height: 320,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: Colors.surface,
  },
  cardImage: { width: "100%", height: "100%", position: "absolute" },
  cardOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cardBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.goldDim,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.goldDim,
  },
  cardBadgeText: { color: Colors.goldLight, fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 4 },
  cardMeta: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 8 },
  cardPrice: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  cardPriceValue: { color: Colors.gold, fontWeight: "700", fontSize: 13 },
  actions: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "600",
  },
});
