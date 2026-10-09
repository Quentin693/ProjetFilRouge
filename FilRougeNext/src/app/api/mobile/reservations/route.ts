import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: {
      voyage: { select: { id: true, title: true, imageUrl: true, duration: true } },
      departure: { select: { id: true, departDate: true, returnDate: true } },
      checkIns: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const adapted = reservations.map((r) => ({
    id: r.id,
    status: r.status,
    totalPrice: r.totalPrice,
    passengers: r.passengers ?? [],
    createdAt: r.createdAt.toISOString(),
    voyage: r.voyage,
    departure: {
      id: r.departure.id,
      departureDate: r.departure.departDate.toISOString(),
      returnDate: r.departure.returnDate.toISOString(),
    },
    checkIns: r.checkIns.map((c) => ({
      id: c.id,
      checkedInAt: c.checkedInAt.toISOString(),
      location: c.location,
      latitude: c.latitude,
      longitude: c.longitude,
      nfcTagId: c.nfcTagId,
      reservationId: c.reservationId,
    })),
  }));

  return NextResponse.json(adapted);
}

export async function POST(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { voyageId, departureId, passengers } = body;

    if (!voyageId || !departureId || !passengers?.length) {
      return NextResponse.json(
        { error: "voyageId, departureId et passengers sont requis." },
        { status: 400 }
      );
    }

    // Vérifier le départ et les places disponibles
    const departure = await prisma.departure.findUnique({
      where: { id: departureId },
      include: { voyage: true },
    });

    if (!departure || !departure.active) {
      return NextResponse.json({ error: "Départ introuvable ou inactif." }, { status: 404 });
    }

    const availableSeats = departure.seatsTotal - departure.seatsBooked;
    if (availableSeats < passengers.length) {
      return NextResponse.json({ error: "Plus assez de places disponibles." }, { status: 409 });
    }

    const totalPrice = departure.priceAdult * passengers.length;

    // Créer la réservation dans une transaction
    const reservation = await prisma.$transaction(async (tx) => {
      const created = await tx.reservation.create({
        data: {
          userId: user.id,
          voyageId,
          departureId,
          adults: passengers.length,
          totalPrice,
          status: "CONFIRMED", // Paiement simulé → directement confirmé
          passengers: passengers,
        },
        include: {
          voyage: { select: { id: true, title: true, imageUrl: true, duration: true } },
          departure: { select: { id: true, departDate: true, returnDate: true } },
          checkIns: true,
        },
      });

      await tx.departure.update({
        where: { id: departureId },
        data: { seatsBooked: { increment: passengers.length } },
      });

      await tx.payment.create({
        data: {
          reservationId: created.id,
          amount: totalPrice,
          currency: "EUR",
          status: "PAID",
          method: "mobile",
          paidAt: new Date(),
        },
      });

      return created;
    });

    return NextResponse.json({
      id: reservation.id,
      status: reservation.status,
      totalPrice: reservation.totalPrice,
      passengers: reservation.passengers ?? [],
      createdAt: reservation.createdAt.toISOString(),
      voyage: reservation.voyage,
      departure: {
        id: reservation.departure.id,
        departureDate: reservation.departure.departDate.toISOString(),
        returnDate: reservation.departure.returnDate.toISOString(),
      },
      checkIns: [],
    }, { status: 201 });
  } catch (err) {
    console.error("[mobile/reservations POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
