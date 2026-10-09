import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Colors } from "@/constants/colors";
import { destinationService } from "@/services/api";
import type { NearbyDestination } from "@/types";
import CardMap from "@/components/ui/card-map";


const ROME_LAT = 41.9028;
const ROME_LNG = 12.4964;

const WORLD_RADIUS_KM = 20000;
const NEARBY_LIST_KM = 2000;

export default function NearbyScreen() {
  const mapRef = useRef<MapView>(null);
  const [destinations, setDestinations] = useState<NearbyDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const mappedDestinations = useMemo(
    () =>
      destinations.filter(
        (d) => typeof d.latitude === "number" && typeof d.longitude === "number"
      ),
    [destinations]
  );

  const nearbyList = useMemo(
    () => mappedDestinations.filter((d) => d.distanceKm <= NEARBY_LIST_KM),
    [mappedDestinations]
  );

  const fitMap = (lat: number, lng: number, pins: NearbyDestination[]) => {
    if (!mapRef.current) return;

    if (pins.length === 0) {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 8,
          longitudeDelta: 8,
        },
        400
      );
      return;
    }

    mapRef.current.fitToCoordinates(
      [
        { latitude: lat, longitude: lng },
        ...pins.map((d) => ({
          latitude: d.latitude!,
          longitude: d.longitude!,
        })),
      ],
      {
        edgePadding: { top: 60, right: 40, bottom: 40, left: 40 },
        animated: true,
      }
    );
  };

  const requestLocation = async () => {
    setLoading(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError(
        "La permission de localisation est nécessaire pour afficher la carte et les destinations proches."
      );
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const res = await destinationService.nearby(
        latitude,
        longitude,
        WORLD_RADIUS_KM
      );
      if (res.data) {
        setDestinations(res.data);
        setTimeout(() => fitMap(latitude, longitude, res.data), 300);
      } else {
        setLocationError(
          res.error ?? "Erreur lors de la récupération des destinations."
        );
      }
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
        <Text style={styles.subtitle}>
          {mappedDestinations.length} destination
          {mappedDestinations.length > 1 ? "s" : ""} · votre position GPS
        </Text>
      </View>

      {userLocation && (
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              latitudeDelta: 20,
              longitudeDelta: 20,
            }}
            showsUserLocation
            showsMyLocationButton={Platform.OS === "android"}
            showsCompass
            mapType="standard"
          >
            {mappedDestinations.map((d) => (
              <Marker
                key={d.id}
                coordinate={{
                  latitude: d.latitude!,
                  longitude: d.longitude!,
                }}
                title={d.name}
                description={`${d.country} · ${d.distanceKm.toFixed(0)} km`}
                pinColor={selectedId === d.id ? Colors.gold : "#C9A84C"}
                onPress={() => setSelectedId(d.id)}
              />
            ))}
            <CardMap />
            //ajoute moi un marker pour rome
            <Marker
              coordinate={{ latitude: ROME_LAT, longitude: ROME_LNG }}
              title="Rome"
            >
              <Image source={require('/Users/quentinho/Projets/EEMI/ProjetFilRouge/FilRougeNative/assets/rome.png')} style={{ width: 20, height: 20 }} />
            </Marker>
          </MapView>

          <TouchableOpacity
            style={styles.recenterButton}
            onPress={() =>
              userLocation &&
              fitMap(userLocation.lat, userLocation.lng, mappedDestinations)
            }
          >
            <Text style={styles.recenterText}>Recadrer</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={nearbyList.length > 0 ? nearbyList : mappedDestinations.slice(0, 8)}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.listTitle}>
            {nearbyList.length > 0
              ? `Proches de vous (< ${NEARBY_LIST_KM} km)`
              : "Toutes les destinations"}
          </Text>
        }
        renderItem={({ item: d }) => (
          <TouchableOpacity
            style={[styles.card, selectedId === d.id && styles.cardSelected]}
            onPress={() => {
              setSelectedId(d.id);
              if (d.latitude != null && d.longitude != null && mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: d.latitude,
                    longitude: d.longitude,
                    latitudeDelta: 12,
                    longitudeDelta: 12,
                  },
                  350
                );
              }
            }}
            onLongPress={() => router.push("/(app)/(tabs)/voyages")}
          >
            <Image source={{ uri: d.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{d.name}</Text>
                  <Text style={styles.cardCountry}>{d.country}</Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {d.distanceKm.toFixed(0)} km
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {d.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>Aucune destination</Text>
            <Text style={styles.emptyText}>
              Aucune destination avec coordonnées GPS n'est disponible.
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
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
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
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  mapWrap: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  map: { width: "100%", height: "100%" },
  recenterButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recenterText: { color: Colors.gold, fontWeight: "700", fontSize: 12 },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.gold,
  },
  cardImage: { width: "100%", height: 140 },
  cardBody: { padding: 14 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  cardName: { fontSize: 17, fontWeight: "700", color: Colors.textPrimary },
  cardCountry: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  distanceBadge: {
    backgroundColor: Colors.goldDim,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  distanceText: { color: Colors.gold, fontSize: 12, fontWeight: "700" },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  emptyCenter: { alignItems: "center", paddingTop: 40, paddingHorizontal: 40 },
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
