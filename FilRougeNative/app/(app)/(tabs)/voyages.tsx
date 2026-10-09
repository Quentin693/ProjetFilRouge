import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { voyageService } from "@/services/api";
import type { Voyage } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 12;
const H_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;

const CATEGORIES = [
  { id: "Tous", label: "Tous", emoji: "🌍" },
  { id: "LUXURY", label: "Luxe", emoji: "✨" },
  { id: "PREMIUM", label: "Premium", emoji: "💎" },
  { id: "ADVENTURE", label: "Aventure", emoji: "🧗" },
  { id: "HONEYMOON", label: "Lune de miel", emoji: "💕" },
  { id: "FAMILY", label: "Famille", emoji: "👨‍👩‍👧‍👦" },
  { id: "SOLO", label: "Solo", emoji: "🧘" },
];

export default function VoyagesScreen() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<TextInput>(null);

  const load = async (currentSearch?: string, currentCategory?: string) => {
    setLoading(true);
    const cat = currentCategory ?? category;
    const q = currentSearch !== undefined ? currentSearch : search;
    const res = await voyageService.list({
      category: cat === "Tous" ? undefined : cat,
      search: q.trim() || undefined,
    });
    if (res.data) setVoyages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load(undefined, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearch = () => {
    searchRef.current?.blur();
    load(search, category);
  };

  const handleClearSearch = () => {
    setSearch("");
    load("", category);
  };

  const activeDeparturesCount = (v: Voyage) =>
    v.departures.filter((d) => d.isActive).length;

  const totalDeparts = voyages.reduce(
    (acc, v) => acc + activeDeparturesCount(v),
    0
  );
  const minPrice =
    voyages.length > 0
      ? Math.min(...voyages.map((v) => v.price)).toLocaleString("fr-FR")
      : "—";

  const renderCard = ({ item: v, index }: { item: Voyage; index: number }) => {
    const isLeft = index % 2 === 0;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isLeft ? { marginRight: GAP / 2 } : { marginLeft: GAP / 2 },
        ]}
        onPress={() => router.push(`/(app)/voyages/${v.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: v.imageUrl }} style={styles.cardImage} />
          <View style={styles.cardImageOverlay} />
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>{v.category}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {v.title}
          </Text>
          <Text style={styles.cardDestination} numberOfLines={1}>
            📍 {v.destination.name}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>
              {v.price.toLocaleString("fr-FR")} €
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardDays}>{v.duration}j</Text>
              {activeDeparturesCount(v) > 0 && <View style={styles.dotAvail} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Header interne au FlatList (catégories + compteur uniquement — pas de TextInput)
  const renderListHeader = () => (
    <View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{voyages.length}</Text>
          <Text style={styles.statLabel}>
            voyage{voyages.length > 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalDeparts}</Text>
          <Text style={styles.statLabel}>départs dispo</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{minPrice} €</Text>
          <Text style={styles.statLabel}>dès</Text>
        </View>
      </View>

      {/* Catégories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, category === item.id && styles.chipActive]}
            onPress={() => setCategory(item.id)}
          >
            <Text style={styles.chipEmoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.chipText,
                category === item.id && styles.chipTextActive,
              ]}
            >
              {item.emoji} {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionLabel}>
        {loading
          ? "Chargement..."
          : `${voyages.length} résultat${voyages.length > 1 ? "s" : ""}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Zone fixe du haut (titre + recherche) ──
          Le TextInput est HORS du FlatList : il ne sera jamais
          démonté/remonté lors des re-renders, donc le clavier reste ouvert. */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.heroSubtitle}>Explorez le monde</Text>
            <Text style={styles.heroTitle}>Nos Voyages</Text>
          </View>
        </View>

        {/* Barre de recherche */}
        <View
          style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused,
          ]}
        >
          <Text style={styles.searchIconText}>🔍</Text>
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Destination, pays, activité..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Liste des voyages ── */}
      <FlatList
        data={voyages}
        keyExtractor={(v) => v.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderListHeader}
        renderItem={renderCard}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              color={Colors.gold}
              style={{ marginTop: 40 }}
              size="large"
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌍</Text>
              <Text style={styles.emptyTitle}>Aucun voyage trouvé</Text>
              <Text style={styles.emptyText}>
                Essayez de modifier votre recherche ou de changer de catégorie.
              </Text>
              <TouchableOpacity
                style={styles.emptyReset}
                onPress={() => {
                  setSearch("");
                  setCategory("Tous");
                  load("", "Tous");
                }}
              >
                <Text style={styles.emptyResetText}>
                  Réinitialiser les filtres
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  /* ── Top bar fixe ── */
  topBar: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: H_PADDING,
    paddingBottom: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  /* Search */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 9,
    gap: 10,
  },
  searchContainerFocused: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surfaceElevated,
  },
  searchIconText: { fontSize: 15 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtnText: { color: Colors.textMuted, fontSize: 9, fontWeight: "800" },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 4,
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 16, fontWeight: "800", color: Colors.gold },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  /* Categories */
  categories: {
    paddingVertical: 14,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.goldDim,
    borderColor: Colors.gold,
  },
  chipEmoji: { fontSize: 14 },
  chipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: Colors.gold },

  sectionLabel: {
    paddingBottom: 12,
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "600",
  },

  /* Grid */
  list: { paddingHorizontal: H_PADDING, paddingTop: 16, paddingBottom: 100 },
  columnWrapper: { marginBottom: GAP },

  /* Cards */
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImageContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    position: "relative",
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cardBadgeText: {
    color: Colors.goldLight,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardBody: { padding: 10 },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDestination: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: { fontSize: 14, fontWeight: "800", color: Colors.gold },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardDays: { fontSize: 10, color: Colors.textMuted, fontWeight: "600" },
  dotAvail: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },

  /* Empty */
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyReset: {
    backgroundColor: Colors.goldDim,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  emptyResetText: { color: Colors.gold, fontWeight: "700", fontSize: 14 },
});
