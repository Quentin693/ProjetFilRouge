import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: { id, userId: user.id },
    include: {
      voyage: { select: { id: true, title: true, imageUrl: true, duration: true } },
      departure: { select: { id: true, departDate: true, returnDate: true } },
      checkIns: { orderBy: { checkedInAt: "desc" } },
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
  }

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
    checkIns: reservation.checkIns.map((c) => ({
      id: c.id,
      checkedInAt: c.checkedInAt.toISOString(),
      location: c.location,
      latitude: c.latitude,
      longitude: c.longitude,
      nfcTagId: c.nfcTagId,
      reservationId: c.reservationId,
    })),
  });
}
