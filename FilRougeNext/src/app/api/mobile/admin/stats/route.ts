import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    newUsersThisMonth,
    totalReservations,
    reservationsThisMonth,
    revenueData,
    revenueLastMonth,
    topVoyages,
    topDestinations,
    byStatus,
    byCategory,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: firstOfMonth } } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { createdAt: { gte: firstOfMonth } } }),
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: firstOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.voyage.findMany({
      take: 5,
      orderBy: { reservations: { _count: "desc" } },
      include: {
        _count: { select: { reservations: true } },
        destination: { select: { name: true } },
      },
    }),
    prisma.destination.findMany({
      take: 5,
      orderBy: { voyages: { _count: "desc" } },
      include: { _count: { select: { voyages: true } } },
    }),
    prisma.reservation.groupBy({ by: ["status"], _count: true }),
    prisma.voyage.groupBy({ by: ["category"], _count: true }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true } },
        voyage: { select: { title: true } },
      },
    }),
  ]);

  const totalRevenue = revenueData._sum.totalPrice ?? 0;
  const lastMonthRevenue = revenueLastMonth._sum.totalPrice ?? 0;
  const revenueGrowth =
    lastMonthRevenue > 0
      ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

  return NextResponse.json({
    totalUsers,
    newUsersThisMonth,
    totalReservations,
    reservationsThisMonth,
    totalRevenue,
    lastMonthRevenue,
    revenueGrowth,
    topVoyages: topVoyages.map((v) => ({
      id: v.id,
      title: v.title,
      destination: v.destination.name,
      reservations: v._count.reservations,
    })),
    topDestinations: topDestinations.map((d) => ({
      id: d.id,
      name: d.name,
      voyages: d._count.voyages,
    })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count })),
    recentActivity: recentActivity.map((res) => ({
      id: res.id,
      totalPrice: res.totalPrice,
      createdAt: res.createdAt.toISOString(),
      userName: res.user.name,
      voyageTitle: res.voyage.title,
    })),
  });
}
