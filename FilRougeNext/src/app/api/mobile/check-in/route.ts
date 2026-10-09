import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

// POST /api/mobile/check-in — Enregistrer un check-in NFC
export async function POST(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nfcTagId, reservationId, latitude, longitude, location } = body;

    if (!nfcTagId || !reservationId) {
      return NextResponse.json(
        { error: "nfcTagId et reservationId sont requis." },
        { status: 400 }
      );
    }

    // Vérifier que la réservation appartient à l'utilisateur et est confirmée
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: user.id,
        status: "CONFIRMED",
      },
    });

    if (!reservation) {
      return NextResponse.json(
        {
          error:
            "Réservation introuvable, non confirmée, ou ne vous appartient pas.",
        },
        { status: 403 }
      );
    }

    // Vérifier si un check-in avec ce tag NFC existe déjà pour cette réservation
    const existing = await prisma.checkIn.findFirst({
      where: { reservationId, nfcTagId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ce tag NFC a déjà été scanné pour cette réservation." },
        { status: 409 }
      );
    }

    // Créer le check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        reservationId,
        nfcTagId,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        location: location ?? null,
      },
    });

    return NextResponse.json(
      {
        id: checkIn.id,
        checkedInAt: checkIn.checkedInAt.toISOString(),
        location: checkIn.location,
        latitude: checkIn.latitude,
        longitude: checkIn.longitude,
        nfcTagId: checkIn.nfcTagId,
        reservationId: checkIn.reservationId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[mobile/check-in POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// GET /api/mobile/check-in — Historique des check-ins de l'utilisateur
export async function GET(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const checkIns = await prisma.checkIn.findMany({
    where: {
      reservation: { userId: user.id },
    },
    include: {
      reservation: {
        select: {
          id: true,
          voyage: { select: { title: true, imageUrl: true } },
        },
      },
    },
    orderBy: { checkedInAt: "desc" },
  });

  return NextResponse.json(
    checkIns.map((c) => ({
      id: c.id,
      checkedInAt: c.checkedInAt.toISOString(),
      location: c.location,
      latitude: c.latitude,
      longitude: c.longitude,
      nfcTagId: c.nfcTagId,
      reservationId: c.reservationId,
      voyage: c.reservation.voyage,
    }))
  );
}
