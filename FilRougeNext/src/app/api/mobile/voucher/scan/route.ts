import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mobile/voucher/scan
 * Parcours métier BILLET :
 * QR → payload (reservationId + token) → validation → check-in → feedback
 */
export async function POST(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reservationId, token, latitude, longitude } = body as {
      reservationId?: string;
      token?: string;
      latitude?: number;
      longitude?: number;
    };

    if (!reservationId || !token) {
      return NextResponse.json(
        { error: "reservationId et token sont requis." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, userId: user.id },
      include: {
        voyage: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            duration: true,
            destination: { select: { name: true, country: true } },
          },
        },
        departure: {
          select: { id: true, departDate: true, returnDate: true },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation introuvable ou elle ne vous appartient pas." },
        { status: 404 }
      );
    }

    const expectedToken = reservation.reference.slice(0, 8).toUpperCase();
    if (token.toUpperCase() !== expectedToken) {
      return NextResponse.json(
        { error: "Token du voucher invalide." },
        { status: 403 }
      );
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        {
          error: `Check-in impossible : statut ${reservation.status}. La réservation doit être confirmée.`,
        },
        { status: 409 }
      );
    }

    // Identifiant stable du "tag" QR pour éviter le double scan
    const qrTagId = `QR:${expectedToken}`;

    const existing = await prisma.checkIn.findFirst({
      where: { reservationId, nfcTagId: qrTagId },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Ce billet a déjà été scanné (check-in déjà enregistré).",
          alreadyCheckedIn: true,
          checkIn: {
            id: existing.id,
            checkedInAt: existing.checkedInAt.toISOString(),
          },
          reservation: serializeReservation(reservation),
        },
        { status: 409 }
      );
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        reservationId,
        nfcTagId: qrTagId,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        location: "Check-in QR voucher",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Check-in billet réussi",
        checkIn: {
          id: checkIn.id,
          checkedInAt: checkIn.checkedInAt.toISOString(),
          location: checkIn.location,
          latitude: checkIn.latitude,
          longitude: checkIn.longitude,
        },
        reservation: serializeReservation(reservation),
        pdfUrl: `/api/reservations/${reservation.id}/pdf?token=${expectedToken}`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[mobile/voucher/scan POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

function serializeReservation(reservation: {
  id: string;
  status: string;
  totalPrice: number;
  reference: string;
  voyage: {
    id: string;
    title: string;
    imageUrl: string;
    duration: number;
    destination: { name: string; country: string };
  };
  departure: { id: string; departDate: Date; returnDate: Date };
}) {
  return {
    id: reservation.id,
    status: reservation.status,
    totalPrice: reservation.totalPrice,
    reference: reservation.reference.slice(0, 8).toUpperCase(),
    voyage: {
      id: reservation.voyage.id,
      title: reservation.voyage.title,
      imageUrl: reservation.voyage.imageUrl,
      duration: reservation.voyage.duration,
      destination: reservation.voyage.destination,
    },
    departure: {
      id: reservation.departure.id,
      departureDate: reservation.departure.departDate.toISOString(),
      returnDate: reservation.departure.returnDate.toISOString(),
    },
  };
}
