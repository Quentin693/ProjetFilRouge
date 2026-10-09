import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width } = Dimensions.get("window");
const SCAN_SIZE = width * 0.7;

export default function QrScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const scanCooldown = useRef(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanCooldown.current || scanned) return;
    scanCooldown.current = true;

    setScanned(true);
    setScannedUrl(data);
  };

  const handleOpenPdf = async () => {
    if (!scannedUrl) return;

    // Vérifier que l'URL est valide et pointe vers notre API
    try {
      const url = new URL(scannedUrl);
      const isPdfRoute = url.pathname.includes("/api/reservations/") && url.pathname.includes("/pdf");

      if (!isPdfRoute) {
        Alert.alert(
          "QR Code invalide",
          "Ce QR code ne correspond pas à un voucher Voyage Luxe.",
          [{ text: "OK", onPress: resetScan }]
        );
        return;
      }

      const canOpen = await Linking.canOpenURL(scannedUrl);
      if (canOpen) {
        await Linking.openURL(scannedUrl);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir ce lien.", [{ text: "OK", onPress: resetScan }]);
      }
    } catch {
      // URL invalide → essayons quand même de l'ouvrir
      try {
        await Linking.openURL(scannedUrl);
      } catch {
        Alert.alert("Erreur", "Lien invalide.", [{ text: "OK", onPress: resetScan }]);
      }
    }
  };

  const resetScan = () => {
    setScanned(false);
    setScannedUrl(null);
    setTimeout(() => {
      scanCooldown.current = false;
    }, 1000);
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
            L'accès à la caméra est nécessaire pour scanner le QR code de votre voucher.
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Scanner le voucher</Text>
          <Text style={styles.subtitle}>
            Pointez votre caméra vers le QR code affiché sur l'application web
          </Text>
        </View>
      </View>

      {!scanned ? (
        <>
          {/* Caméra avec overlay */}
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleBarCodeScanned}
            />

            {/* Overlay sombre autour du cadre */}
            <View style={styles.overlay}>
              {/* Haut */}
              <View style={[styles.overlaySection, { height: (styles.cameraContainer.height - SCAN_SIZE) / 2 }]} />
              {/* Milieu */}
              <View style={styles.overlayMiddle}>
                <View style={[styles.overlaySection, { width: (width - SCAN_SIZE) / 2 }]} />
                {/* Cadre de scan */}
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <View style={[styles.overlaySection, { width: (width - SCAN_SIZE) / 2 }]} />
              </View>
              {/* Bas */}
              <View style={[styles.overlaySection, { height: (styles.cameraContainer.height - SCAN_SIZE) / 2 }]} />
            </View>

            {/* Instruction */}
            <View style={styles.scanInstruction}>
              <Text style={styles.scanInstructionText}>
                🎫 Alignez le QR code dans le cadre
              </Text>
            </View>
          </View>

          {/* Hint */}
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              Le QR code se trouve sur la page de confirmation ou de détail de votre réservation sur le site web.
            </Text>
          </View>
        </>
      ) : (
        /* Résultat du scan */
        <View style={styles.centered}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✅</Text>
          </View>
          <Text style={styles.successTitle}>QR Code scanné !</Text>
          <Text style={styles.successSubtitle}>Voucher de voyage détecté</Text>

          {scannedUrl && (
            <View style={styles.urlBox}>
              <Text style={styles.urlLabel}>URL du voucher</Text>
              <Text style={styles.urlText} numberOfLines={2}>{scannedUrl}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleOpenPdf}>
              <Text style={styles.primaryButtonText}>📄 Ouvrir le PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={resetScan}>
              <Text style={styles.secondaryButtonText}>Scanner à nouveau</Text>
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
  headerContent: {
    flex: 1,
  },
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
  // Caméra
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
  // Hint
  hint: {
    padding: 20,
    paddingTop: 16,
  },
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
  // États
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
  // Succès
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
  successIcon: { fontSize: 44 },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  urlBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",
    marginBottom: 28,
  },
  urlLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  urlText: {
    fontSize: 11,
    color: Colors.gold,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  // Boutons
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
