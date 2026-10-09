import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import type { ReservationStatus } from "@prisma/client";

const VALID_STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "REFUNDED",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Accès administrateur requis." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status?: string };

  if (!status || !VALID_STATUSES.includes(status as ReservationStatus)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation introuvable." },
      { status: 404 }
    );
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: status as ReservationStatus },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
