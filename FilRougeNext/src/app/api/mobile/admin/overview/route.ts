import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const [
    totalUsers,
    totalReservations,
    totalVoyages,
    pendingReservations,
    recentReservations,
    revenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.reservation.count(),
    prisma.voyage.count(),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.reservation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        voyage: { select: { title: true } },
      },
    }),
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalReservations,
    totalVoyages,
    pendingReservations,
    totalRevenue: revenue._sum.totalPrice || 0,
    recentReservations: recentReservations.map((res) => ({
      id: res.id,
      status: res.status,
      totalPrice: res.totalPrice,
      createdAt: res.createdAt.toISOString(),
      user: res.user,
      voyage: res.voyage,
    })),
  });
}
