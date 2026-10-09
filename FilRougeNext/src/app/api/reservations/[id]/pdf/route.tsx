import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0D0D0D",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#C9A84C",
  },
  brand: {
    fontSize: 22,
    color: "#C9A84C",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
    letterSpacing: 1,
  },
  refBadge: {
    backgroundColor: "#C9A84C",
    borderRadius: 6,
    padding: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  refLabel: {
    fontSize: 7,
    color: "#000",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  refValue: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A3A1A",
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2D6A2D",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#4ADE80",
    fontFamily: "Helvetica-Bold",
  },
  voyageSection: { marginBottom: 28 },
  voyageTitle: {
    fontSize: 26,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  voyageDestination: {
    fontSize: 13,
    color: "#C9A84C",
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
  },
  infoLabel: {
    fontSize: 8,
    color: "#555",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
  },
  infoValueGold: {
    fontSize: 16,
    color: "#C9A84C",
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    marginTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E1E",
    letterSpacing: 0.5,
  },
  passengerCard: {
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  passengerIndex: {
    fontSize: 10,
    color: "#C9A84C",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    width: "100%",
  },
  passengerField: { width: "45%" },
  passengerFieldLabel: {
    fontSize: 8,
    color: "#555",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  passengerFieldValue: {
    fontSize: 11,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
  },
  footerText: { fontSize: 9, color: "#444" },
  footerBrand: {
    fontSize: 9,
    color: "#C9A84C",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  specialBox: {
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    marginTop: 8,
  },
  specialText: { fontSize: 11, color: "#888", lineHeight: 1.6 },
});

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token requis." }, { status: 401 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      voyage: { include: { destination: true } },
      departure: true,
      payment: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
  }

  const expectedToken = reservation.reference.slice(0, 8).toUpperCase();
  if (token.toUpperCase() !== expectedToken) {
    return NextResponse.json({ error: "Token invalide." }, { status: 403 });
  }

  const passengers =
    (reservation.passengers as Array<{
      firstName: string;
      lastName: string;
      birthDate?: string;
      dateOfBirth?: string;
      passportNumber: string;
    }> | null) ?? [];

  const nights = Math.round(
    (new Date(reservation.departure.returnDate).getTime() -
      new Date(reservation.departure.departDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const pdfBuffer = await renderToBuffer(
    <Document
      title={`Voucher - ${reservation.voyage.title}`}
      author="Voyage Luxe"
      subject="Bon de voyage"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>VOYAGE LUXE</Text>
            <Text style={styles.brandSub}>BON DE VOYAGE · VOUCHER</Text>
          </View>
          <View style={styles.refBadge}>
            <Text style={styles.refLabel}>RÉFÉRENCE</Text>
            <Text style={styles.refValue}>
              #{reservation.reference.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {reservation.status === "CONFIRMED"
              ? "✓ Réservation confirmée & payée"
              : reservation.status === "COMPLETED"
                ? "✓ Voyage terminé"
                : "En attente de confirmation"}
          </Text>
        </View>

        <View style={styles.voyageSection}>
          <Text style={styles.voyageTitle}>{reservation.voyage.title}</Text>
          <Text style={styles.voyageDestination}>
            {reservation.voyage.destination.name}, {reservation.voyage.destination.country}
          </Text>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>DATE DE DÉPART</Text>
            <Text style={styles.infoValue}>
              {formatDate(reservation.departure.departDate)}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>DATE DE RETOUR</Text>
            <Text style={styles.infoValue}>
              {formatDate(reservation.departure.returnDate)} ({nights} nuits)
            </Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>VOYAGEURS</Text>
            <Text style={styles.infoValue}>
              {reservation.adults} adulte{reservation.adults > 1 ? "s" : ""}
              {reservation.children > 0
                ? ` · ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}`
                : ""}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>MONTANT PAYÉ</Text>
            <Text style={styles.infoValueGold}>
              {reservation.totalPrice.toLocaleString("fr-FR")} €
            </Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>CLIENT</Text>
            <Text style={styles.infoValue}>{reservation.user.name ?? "—"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>EMAIL</Text>
            <Text style={styles.infoValue}>{reservation.user.email}</Text>
          </View>
        </View>

        {passengers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>PASSAGERS ({passengers.length})</Text>
            {passengers.map((p, i) => (
              <View key={i} style={styles.passengerCard}>
                <Text style={styles.passengerIndex}>
                  {i < reservation.adults
                    ? `ADULTE ${i + 1}`
                    : `ENFANT ${i - reservation.adults + 1}`}
                </Text>
                <View style={styles.passengerField}>
                  <Text style={styles.passengerFieldLabel}>PRÉNOM</Text>
                  <Text style={styles.passengerFieldValue}>{p.firstName}</Text>
                </View>
                <View style={styles.passengerField}>
                  <Text style={styles.passengerFieldLabel}>NOM</Text>
                  <Text style={styles.passengerFieldValue}>{p.lastName}</Text>
                </View>
                <View style={styles.passengerField}>
                  <Text style={styles.passengerFieldLabel}>DATE DE NAISSANCE</Text>
                  <Text style={styles.passengerFieldValue}>
                    {p.dateOfBirth ?? p.birthDate ?? "—"}
                  </Text>
                </View>
                <View style={styles.passengerField}>
                  <Text style={styles.passengerFieldLabel}>N° PASSEPORT</Text>
                  <Text style={styles.passengerFieldValue}>
                    {p.passportNumber?.toUpperCase() ?? "—"}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {reservation.specialRequests && (
          <>
            <Text style={styles.sectionTitle}>DEMANDES PARTICULIÈRES</Text>
            <View style={styles.specialBox}>
              <Text style={styles.specialText}>{reservation.specialRequests}</Text>
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Émis le {formatDate(new Date())} · Réservé le {formatDate(reservation.createdAt)}
          </Text>
          <Text style={styles.footerBrand}>VOYAGE LUXE</Text>
        </View>
      </Page>
    </Document>
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="voucher-${reservation.reference.slice(0, 8).toUpperCase()}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
