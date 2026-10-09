import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import * as Location from "expo-location";
import { Colors } from "@/constants/colors";
import { destinationService } from "@/services/api";
import type { NearbyDestination } from "@/types";

export default function NearbyScreen() {
  const [destinations, setDestinations] = useState<NearbyDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError(
        "La permission de localisation est nécessaire pour afficher les destinations proches."
      );
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const res = await destinationService.nearby(latitude, longitude, 5000);
      if (res.data) setDestinations(res.data);
      else setLocationError(res.error ?? "Erreur lors de la récupération des destinations.");
    } catch {
      setLocationError("Impossible de récupérer votre position.");
    }

    setLoading(false);
  };

  useEffect(() => {
    requestLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.gold} size="large" />
        <Text style={styles.loadingText}>Localisation en cours...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Localisation requise</Text>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestLocation}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>À proximité</Text>
        {userLocation && (
          <Text style={styles.subtitle}>
            📍 {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
          </Text>
        )}
      </View>

      <FlatList
        data={destinations}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: d }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/(tabs)/voyages`)}
          >
            <Image source={{ uri: d.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardName}>{d.name}</Text>
                  <Text style={styles.cardCountry}>{d.country}</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{d.distanceKm.toFixed(0)} km</Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{d.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>Aucune destination proche</Text>
            <Text style={styles.emptyText}>
              Nos destinations de voyage ne sont pas encore à proximité de votre position actuelle.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: { color: Colors.textSecondary, marginTop: 16, fontSize: 14 },
  errorIcon: { fontSize: 56, marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary, marginBottom: 8 },
  errorText: {
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: { color: "#000", fontWeight: "700", fontSize: 14 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, fontFamily: "monospace" },
  list: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: { width: "100%", height: 160 },
  cardBody: { padding: 16 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardName: { fontSize: 18, fontWeight: "700", color: Colors.textPrimary },
  cardCountry: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  distanceBadge: {
    backgroundColor: Colors.goldDim,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  distanceText: { color: Colors.gold, fontSize: 12, fontWeight: "700" },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  emptyCenter: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
