import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentReservations } from "@/components/dashboard/recent-reservations";
import { UpcomingTrips } from "@/components/dashboard/upcoming-trips";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getUserData(userId: string) {
  const [reservations, upcomingTrips] = await Promise.all([
    prisma.reservation.findMany({
      where: { userId },
      include: {
        voyage: { include: { destination: true } },
        departure: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.reservation.findMany({
      where: {
        userId,
        status: "CONFIRMED",
        departure: { departDate: { gte: new Date() } },
      },
      include: {
        voyage: { include: { destination: true } },
        departure: true,
      },
      orderBy: { departure: { departDate: "asc" } },
      take: 3,
    }),
  ]);

  const totalSpent = reservations
    .filter((r: { status: string }) => r.status === "CONFIRMED" || r.status === "COMPLETED")
    .reduce((sum: number, r: { totalPrice: number }) => sum + r.totalPrice, 0);

  const stats = {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter(
      (r: { status: string }) => r.status === "CONFIRMED" || r.status === "COMPLETED"
    ).length,
    upcomingCount: upcomingTrips.length,
    totalSpent,
  };

  return { reservations, upcomingTrips, stats };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const t = await getTranslations("dashboard");
  const { reservations, upcomingTrips, stats } = await getUserData(session.user.id);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-3xl text-white">{t("title")}</h1>
        <p className="text-white/40 text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Trips */}
        <div className="lg:col-span-2">
          <UpcomingTrips trips={upcomingTrips} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Reservations */}
      <RecentReservations reservations={reservations} />
    </div>
  );
}
