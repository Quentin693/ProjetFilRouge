import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import type { ReservationStatus } from "@prisma/client";

const STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "REFUNDED",
];

export async function GET(req: NextRequest) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const statusFilter =
    status && status !== "ALL" && STATUSES.includes(status as ReservationStatus)
      ? (status as ReservationStatus)
      : undefined;

  const [reservations, counts] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(q
          ? {
              OR: [
                { reference: { contains: q, mode: "insensitive" } },
                { user: { name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } },
                { voyage: { title: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        voyage: { select: { title: true, imageUrl: true } },
        departure: { select: { departDate: true, returnDate: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.reservation.groupBy({ by: ["status"], _count: true }),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((s, c) => s + c._count, 0);

  return NextResponse.json({
    total,
    counts: countMap,
    reservations: reservations.map((res) => ({
      id: res.id,
      reference: res.reference,
      status: res.status,
      adults: res.adults,
      children: res.children,
      totalPrice: res.totalPrice,
      createdAt: res.createdAt.toISOString(),
      user: res.user,
      voyage: res.voyage,
      departure: {
        departureDate: res.departure.departDate.toISOString(),
        returnDate: res.departure.returnDate.toISOString(),
      },
      paymentStatus: res.payment?.status ?? null,
    })),
  });
}
