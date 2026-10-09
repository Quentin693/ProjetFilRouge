import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/colors";
import { voyageService, reservationService } from "@/services/api";
import type { Voyage, Departure } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Images supplémentaires par voyage.
 * Clé = sous-chaîne du titre ou du nom de destination (insensible à la casse).
 * Chemin relatif depuis app/(app)/voyages/[id].tsx → assets/ = ../../../assets/
 */
const EXTRA_IMAGES: Record<string, ImageSourcePropType[]> = {
  ibiza: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("../../../assets/image.png"),
  ],
};

function getExtraImages(voyage: Voyage): ImageSourcePropType[] {
  const key = Object.keys(EXTRA_IMAGES).find(
    (k) =>
      voyage.title.toLowerCase().includes(k) ||
      voyage.destination.name.toLowerCase().includes(k)
  );
  return key ? EXTRA_IMAGES[key] : [];
}

export default function VoyageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;
    voyageService.get(id).then((res) => {
      if (res.data) setVoyage(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleBook = async () => {
    if (!voyage || !selectedDeparture) return;
    setBooking(true);
    const res = await reservationService.create({
      voyageId: voyage.id,
      departureId: selectedDeparture.id,
      passengers: [
        {
          firstName: "Prénom",
          lastName: "Nom",
          birthDate: "1990-01-01",
          passportNumber: "FR123456",
        },
      ],
    });
    setBooking(false);
    if (res.data) {
      setBookingSuccess(true);
      setBookingModal(false);
      setTimeout(() => {
        setBookingSuccess(false);
        router.push("/(app)/(tabs)/reservations");
      }, 2000);
    }
  };

  const activeDepartures = voyage?.departures.filter((d) => d.isActive) ?? [];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  if (!voyage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Voyage introuvable</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const extraImages = getExtraImages(voyage);
  // Galerie : image principale + images supplémentaires
  const allImages: ImageSourcePropType[] = [
    { uri: voyage.imageUrl },
    ...extraImages,
  ];

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Galerie d'images */}
        <View style={styles.gallery}>
          <FlatList
            ref={galleryRef}
            data={allImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={item}
                style={styles.heroImage}
                resizeMode="cover"
              />
            )}
          />

          {/* Overlay bouton retour + badge */}
          <View style={styles.heroOverlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>‹ Retour</Text>
            </TouchableOpacity>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{voyage.category}</Text>
            </View>
          </View>

          {/* Indicateurs de pagination */}
          {allImages.length > 1 && (
            <View style={styles.pagination}>
              {allImages.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    galleryRef.current?.scrollToIndex({ index: i, animated: true });
                    setActiveImageIndex(i);
                  }}
                >
                  <View
                    style={[
                      styles.paginationDot,
                      i === activeImageIndex && styles.paginationDotActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {activeImageIndex + 1}/{allImages.length}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Titre & destination */}
          <Text style={styles.title}>{voyage.title}</Text>
          <Text style={styles.destination}>
            📍 {voyage.destination.name}, {voyage.destination.country}
          </Text>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{voyage.duration}</Text>
              <Text style={styles.statLabel}>Jours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{activeDepartures.length}</Text>
              <Text style={styles.statLabel}>Départs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.gold }]}>
                {voyage.price.toLocaleString("fr-FR")} €
              </Text>
              <Text style={styles.statLabel}>/ personne</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{voyage.description}</Text>

          {/* Points forts */}
          {voyage.destination.highlights?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Points forts</Text>
              {voyage.destination.highlights.map((h: string, i: number) => (
                <View key={i} style={styles.highlight}>
                  <Text style={styles.highlightDot}>✦</Text>
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </>
          )}

          {/* Miniatures galerie (si plusieurs images) */}
          {allImages.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>Galerie</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              >
                {allImages.map((img, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      galleryRef.current?.scrollToIndex({ index: i, animated: true });
                      setActiveImageIndex(i);
                    }}
                  >
                    <Image
                      source={img}
                      style={[
                        styles.thumbnail,
                        i === activeImageIndex && styles.thumbnailActive,
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Dates de départ */}
          <Text style={styles.sectionTitle}>Dates de départ</Text>
          {activeDepartures.length === 0 ? (
            <View style={styles.noDepartContainer}>
              <Text style={styles.noDepartIcon}>📅</Text>
              <Text style={styles.noDepart}>Aucun départ disponible pour le moment.</Text>
            </View>
          ) : (
            activeDepartures.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.departureCard,
                  selectedDeparture?.id === d.id && styles.departureCardSelected,
                ]}
                onPress={() => setSelectedDeparture(d)}
              >
                <View style={styles.departureLeft}>
                  <View style={[
                    styles.departureCheckbox,
                    selectedDeparture?.id === d.id && styles.departureCheckboxSelected,
                  ]}>
                    {selectedDeparture?.id === d.id && (
                      <Text style={styles.departureCheckmark}>✓</Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.departureDate}>
                      {new Date(d.departureDate).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Text>
                    <Text style={styles.departureReturn}>
                      Retour : {new Date(d.returnDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.seatsInfo}>
                  <Text style={styles.seatsCount}>{d.availableSeats}</Text>
                  <Text style={styles.seatsLabel}>places</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bouton réserver */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>À partir de</Text>
          <Text style={styles.footerPriceValue}>
            {voyage.price.toLocaleString("fr-FR")} €<Text style={styles.footerPriceSub}>/pers.</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, !selectedDeparture && styles.bookButtonDisabled]}
          onPress={() => setBookingModal(true)}
          disabled={!selectedDeparture}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>
            {selectedDeparture ? "Réserver" : "Choisir un départ"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmation */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Confirmer la réservation</Text>

            <View style={styles.modalVoyageRow}>
              <Image
                source={{ uri: voyage.imageUrl }}
                style={styles.modalVoyageImage}
                resizeMode="cover"
              />
              <View style={styles.modalVoyageInfo}>
                <Text style={styles.modalVoyageName} numberOfLines={2}>{voyage.title}</Text>
                <Text style={styles.modalVoyageDest}>
                  📍 {voyage.destination.name}
                </Text>
              </View>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Départ</Text>
                <Text style={styles.modalDetailValue}>
                  {selectedDeparture &&
                    new Date(selectedDeparture.departureDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Durée</Text>
                <Text style={styles.modalDetailValue}>{voyage.duration} jours</Text>
              </View>
              <View style={[styles.modalDetailRow, styles.modalDetailRowLast]}>
                <Text style={styles.modalDetailLabel}>Total</Text>
                <Text style={[styles.modalDetailValue, { color: Colors.gold, fontWeight: "800" }]}>
                  {voyage.price.toLocaleString("fr-FR")} €
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setBookingModal(false)}
                disabled={booking}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, booking && { opacity: 0.6 }]}
                onPress={handleBook}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Succès */}
      {bookingSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Réservation confirmée !</Text>
            <Text style={styles.successSub}>Redirection vers vos réservations…</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { color: Colors.error, fontSize: 16, marginBottom: 12 },
  backLink: { color: Colors.gold, fontSize: 14 },

  /* Galerie */
  gallery: { height: 320, position: "relative" },
  heroImage: { width: SCREEN_WIDTH, height: 320 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    justifyContent: "space-between",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.goldDim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.5)",
  },
  heroBadgeText: { color: Colors.goldLight, fontSize: 12, fontWeight: "700" },

  /* Pagination galerie */
  pagination: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: Colors.gold,
  },
  imageCounter: {
    marginLeft: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  imageCounterText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  /* Contenu */
  content: { padding: 24 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.3 },
  destination: { fontSize: 15, color: Colors.textSecondary, marginBottom: 24 },

  stats: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-around",
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },
  statDivider: { width: 1, backgroundColor: Colors.border },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 28,
  },
  highlight: { flexDirection: "row", gap: 10, marginBottom: 8 },
  highlightDot: { color: Colors.gold, fontSize: 14, marginTop: 1 },
  highlightText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },

  /* Miniatures galerie */
  thumbnailList: { gap: 10, paddingBottom: 24 },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: Colors.gold,
  },

  /* Départs */
  noDepartContainer: { alignItems: "center", paddingVertical: 20 },
  noDepartIcon: { fontSize: 32, marginBottom: 8 },
  noDepart: { color: Colors.textMuted, fontSize: 14 },
  departureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  departureCardSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
  departureLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  departureCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  departureCheckboxSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold,
  },
  departureCheckmark: { color: "#000", fontSize: 12, fontWeight: "800" },
  departureDate: { fontSize: 14, color: Colors.textPrimary, fontWeight: "600", marginBottom: 3 },
  departureReturn: { fontSize: 12, color: Colors.textSecondary },
  seatsInfo: { alignItems: "center", minWidth: 44 },
  seatsCount: { fontSize: 22, fontWeight: "800", color: Colors.gold },
  seatsLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: "600" },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 16,
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600", marginBottom: 2 },
  footerPriceValue: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary },
  footerPriceSub: { fontSize: 12, color: Colors.textMuted, fontWeight: "400" },
  bookButton: {
    flex: 2,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  bookButtonDisabled: { opacity: 0.4 },
  bookButtonText: { color: "#000", fontWeight: "800", fontSize: 16 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginBottom: 20 },

  modalVoyageRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
    padding: 14,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalVoyageImage: { width: 64, height: 64, borderRadius: 12 },
  modalVoyageInfo: { flex: 1, justifyContent: "center" },
  modalVoyageName: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary, marginBottom: 4 },
  modalVoyageDest: { fontSize: 13, color: Colors.textSecondary },

  modalDetails: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalDetailRowLast: { paddingBottom: 0, borderBottomWidth: 0 },
  modalDetailLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  modalDetailValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: "600" },

  modalActions: { flexDirection: "row", gap: 12 },
  modalCancel: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: { color: Colors.textSecondary, fontWeight: "700", fontSize: 14 },
  modalConfirm: {
    flex: 2,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  modalConfirmText: { color: "#000", fontWeight: "800", fontSize: 15 },

  /* Succès */
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gold,
    width: "100%",
  },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: "800", color: Colors.success, marginBottom: 8 },
  successSub: { fontSize: 14, color: Colors.textMuted, textAlign: "center" },
});
