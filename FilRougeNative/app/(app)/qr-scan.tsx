import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { reservationService } from "@/services/api";
import { API_BASE_URL } from "@/constants/api";
import type { Reservation } from "@/types";

const { width } = Dimensions.get("window");
const SCAN_SIZE = width * 0.7;

type ScanResult = {
  reservationId: string;
  token: string;
  rawUrl: string;
};

type VoucherResult = {
  alreadyCheckedIn?: boolean;
  checkIn?: { id: string; checkedInAt: string; location: string | null };
  reservation?: Reservation & {
    reference?: string;
    voyage: Reservation["voyage"] & {
      destination?: { name: string; country: string };
    };
  };
  pdfUrl?: string;
  message?: string;
};

function parseVoucherQr(data: string): ScanResult | null {
  try {
    const url = new URL(data);
    const match = url.pathname.match(
      /\/api\/reservations\/([^/]+)\/pdf\/?$/
    );
    if (!match) return null;

    const reservationId = match[1];
    const token = url.searchParams.get("token");
    if (!token) return null;

    return { reservationId, token, rawUrl: data };
  } catch {
    return null;
  }
}

export default function QrScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoucherResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const scanCooldown = useRef(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const resetScan = () => {
    setScanned(false);
    setLoading(false);
    setError(null);
    setResult(null);
    setPdfUrl(null);
    setTimeout(() => {
      scanCooldown.current = false;
    }, 1000);
  };

  const processScan = async (data: string) => {
    const parsed = parseVoucherQr(data);
    if (!parsed) {
      setError("QR invalide : ce n'est pas un billet Voyage Luxe.");
      setScanned(true);
      return;
    }

    setScanned(true);
    setLoading(true);
    setError(null);

    // GPS optionnel (feedback métier enrichi)
    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch {
      // GPS non bloquant
    }

    const res = await reservationService.scanVoucher({
      reservationId: parsed.reservationId,
      token: parsed.token,
      latitude,
      longitude,
    });

    setLoading(false);

    if (res.error && !res.data) {
      setError(res.error);
      return;
    }

    const dataResult = res.data!;
    setResult(dataResult);
    const absolutePdf = dataResult.pdfUrl
      ? dataResult.pdfUrl.startsWith("http")
        ? dataResult.pdfUrl
        : `${API_BASE_URL}${dataResult.pdfUrl}`
      : parsed.rawUrl;
    setPdfUrl(absolutePdf);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanCooldown.current || scanned || loading) return;
    scanCooldown.current = true;
    processScan(data);
  };

  const handleOpenPdf = async () => {
    if (!pdfUrl) return;
    try {
      const canOpen = await Linking.canOpenURL(pdfUrl);
      if (canOpen) await Linking.openURL(pdfUrl);
      else Alert.alert("Erreur", "Impossible d'ouvrir le PDF.");
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir le PDF.");
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement de la caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Accès caméra requis</Text>
          <Text style={styles.permissionText}>
            L&apos;accès à la caméra est nécessaire pour scanner votre billet QR.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Check-in billet</Text>
          <Text style={styles.subtitle}>
            Scannez le QR de votre voucher — validation et check-in via le serveur
          </Text>
        </View>
      </View>

      {!scanned ? (
        <>
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarCodeScanned}
            />

            <View style={styles.overlay}>
              <View
                style={[
                  styles.overlaySection,
                  { height: (CAMERA_HEIGHT - SCAN_SIZE) / 2 },
                ]}
              />
              <View style={styles.overlayMiddle}>
                <View style={[styles.overlaySection, { width: (width - SCAN_SIZE) / 2 }]} />
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <View style={[styles.overlaySection, { width: (width - SCAN_SIZE) / 2 }]} />
              </View>
              <View
                style={[
                  styles.overlaySection,
                  { height: (CAMERA_HEIGHT - SCAN_SIZE) / 2 },
                ]}
              />
            </View>

            <View style={styles.scanInstruction}>
              <Text style={styles.scanInstructionText}>
                🎫 Alignez le QR du billet dans le cadre
              </Text>
            </View>
          </View>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              Flux métier : scan → extraction ID/token → validation app → API
              backend → check-in → confirmation dans l&apos;app.
            </Text>
          </View>
        </>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={[styles.successSubtitle, { marginTop: 16 }]}>
            Validation du billet auprès du serveur…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={[styles.successCircle, styles.errorCircle]}>
            <Text style={styles.successIcon}>✕</Text>
          </View>
          <Text style={styles.successTitle}>Échec</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={resetScan}>
            <Text style={styles.primaryButtonText}>Scanner à nouveau</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centered}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>
              {result?.alreadyCheckedIn ? "ℹ️" : "✅"}
            </Text>
          </View>
          <Text style={styles.successTitle}>
            {result?.alreadyCheckedIn ? "Déjà enregistré" : "Check-in réussi"}
          </Text>
          <Text style={styles.successSubtitle}>
            {result?.message ??
              (result?.alreadyCheckedIn
                ? "Ce billet a déjà été scanné"
                : "Billet validé par le serveur")}
          </Text>

          {result?.reservation && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Voyage</Text>
              <Text style={styles.cardTitle}>{result.reservation.voyage.title}</Text>
              {result.reservation.voyage.destination && (
                <Text style={styles.cardMeta}>
                  {result.reservation.voyage.destination.name}
                  {", "}
                  {result.reservation.voyage.destination.country}
                </Text>
              )}
              {result.reservation.reference && (
                <Text style={styles.cardToken}>
                  Réf. {result.reservation.reference}
                </Text>
              )}
              {result.checkIn?.checkedInAt && (
                <Text style={styles.cardMeta}>
                  Check-in :{" "}
                  {new Date(result.checkIn.checkedInAt).toLocaleString("fr-FR")}
                </Text>
              )}
            </View>
          )}

          <View style={styles.actionButtons}>
            {result?.reservation?.id && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                  router.replace(`/(app)/reservations/${result.reservation!.id}`)
                }
              >
                <Text style={styles.primaryButtonText}>Voir ma réservation</Text>
              </TouchableOpacity>
            )}
            {pdfUrl && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenPdf}>
                <Text style={styles.secondaryButtonText}>📄 Télécharger le PDF</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.secondaryButton} onPress={resetScan}>
              <Text style={styles.secondaryButtonText}>Scanner un autre billet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const CAMERA_HEIGHT = Dimensions.get("window").height * 0.55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "700",
  },
  headerContent: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cameraContainer: {
    width: "100%",
    height: CAMERA_HEIGHT,
    overflow: "hidden",
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
  },
  overlaySection: {
    backgroundColor: "rgba(13,13,13,0.75)",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: SCAN_SIZE,
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: Colors.gold,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  scanInstruction: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanInstructionText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  hint: { padding: 20, paddingTop: 16 },
  hintText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 100,
  },
  permissionIcon: { fontSize: 52, marginBottom: 16 },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  successCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(201,168,76,0.1)",
    borderWidth: 2,
    borderColor: Colors.gold,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorCircle: {
    borderColor: "#E57373",
    backgroundColor: "rgba(229,115,115,0.1)",
  },
  successIcon: { fontSize: 44 },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#E57373",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cardToken: {
    fontSize: 12,
    color: Colors.gold,
    fontFamily: "monospace",
    marginTop: 8,
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontWeight: "700",
    fontSize: 15,
  },
});
