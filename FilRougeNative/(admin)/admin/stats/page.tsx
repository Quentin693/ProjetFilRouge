import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, Calendar, MapPin, Star, CreditCard } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Statistiques" };

export default async function AdminStatsPage() {
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
    // Top voyages par réservations
    prisma.voyage.findMany({
      take: 5,
      orderBy: { reservations: { _count: "desc" } },
      include: { _count: { select: { reservations: true } }, destination: { select: { name: true } } },
    }),
    // Top destinations
    prisma.destination.findMany({
      take: 5,
      orderBy: { voyages: { _count: "desc" } },
      include: { _count: { select: { voyages: true } } },
    }),
    // Réservations par statut
    prisma.reservation.groupBy({ by: ["status"], _count: true }),
    // Voyages par catégorie
    prisma.voyage.groupBy({ by: ["category"], _count: true }),
    // Activité récente (7 derniers jours)
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
  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING: { label: "En attente", color: "bg-yellow-400" },
    CONFIRMED: { label: "Confirmées", color: "bg-green-400" },
    CANCELLED: { label: "Annulées", color: "bg-red-400" },
    COMPLETED: { label: "Terminées", color: "bg-blue-400" },
    REFUNDED: { label: "Remboursées", color: "bg-purple-400" },
  };

  const CATEGORY_LABELS: Record<string, string> = {
    LUXURY: "Luxe", PREMIUM: "Premium", ADVENTURE: "Aventure",
    HONEYMOON: "Lune de miel", FAMILY: "Famille", SOLO: "Solo",
  };

  const totalResCount = byStatus.reduce((s, b) => s + b._count, 0) || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Statistiques</h1>
        <p className="text-white/40 text-sm mt-1">Vue globale de l&apos;activité de la plateforme</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Revenu total",
            value: `${totalRevenue.toLocaleString("fr-FR")} €`,
            sub: `vs mois dernier ${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}%`,
            icon: CreditCard,
            color: "text-[#C9A84C]",
            bg: "bg-[#C9A84C]/10",
          },
          {
            label: "Utilisateurs",
            value: totalUsers,
            sub: `+${newUsersThisMonth} ce mois`,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Réservations",
            value: totalReservations,
            sub: `+${reservationsThisMonth} ce mois`,
            icon: Calendar,
            color: "text-green-400",
            bg: "bg-green-400/10",
          },
          {
            label: "Taux de confirmation",
            value: `${Math.round(((byStatus.find((b) => b.status === "CONFIRMED")?._count ?? 0) / totalResCount) * 100)}%`,
            sub: `${byStatus.find((b) => b.status === "CONFIRMED")?._count ?? 0} / ${totalReservations}`,
            icon: TrendingUp,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111111] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/50 text-sm">{card.label}</p>
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className={`font-serif text-2xl font-medium ${card.color}`}>{card.value}</p>
              <p className="text-white/30 text-xs mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
          <h2 className="font-serif text-lg text-white mb-5">Répartition des réservations</h2>
          <div className="space-y-3">
            {byStatus.sort((a, b) => b._count - a._count).map((item) => {
              const cfg = STATUS_LABELS[item.status];
              const pct = Math.round((item._count / totalResCount) * 100);
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{cfg?.label ?? item.status}</span>
                    <span className="text-white font-medium">{item._count} <span className="text-white/40 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg?.color ?? "bg-white/30"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Répartition par catégorie de voyage */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
          <h2 className="font-serif text-lg text-white mb-5">Voyages par catégorie</h2>
          <div className="space-y-3">
            {byCategory.sort((a, b) => b._count - a._count).map((item) => {
              const total = byCategory.reduce((s, b) => s + b._count, 0) || 1;
              const pct = Math.round((item._count / total) * 100);
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{CATEGORY_LABELS[item.category] ?? item.category}</span>
                    <span className="text-white font-medium">{item._count} <span className="text-white/40 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#C9A84C]/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top voyages */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
          <h2 className="font-serif text-lg text-white mb-5">🏆 Top voyages</h2>
          <div className="space-y-3">
            {topVoyages.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? "bg-[#C9A84C] text-black" : i === 1 ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{v.title}</p>
                  <p className="text-white/40 text-xs">{v.destination.name}</p>
                </div>
                <span className="text-[#C9A84C] text-sm font-medium shrink-0">{v._count.reservations} rés.</span>
              </div>
            ))}
            {topVoyages.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucune donnée</p>}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
          <h2 className="font-serif text-lg text-white mb-5">⚡ Activité récente (7j)</h2>
          <div className="space-y-2">
            {recentActivity.map((res) => (
              <div key={res.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{res.user.name}</p>
                  <p className="text-white/40 text-xs truncate">{res.voyage.title}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[#C9A84C] text-sm font-medium">{res.totalPrice.toLocaleString("fr-FR")} €</p>
                  <p className="text-white/30 text-xs">
                    {new Date(res.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucune activité cette semaine</p>}
          </div>
        </div>
      </div>

      {/* Top destinations */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
        <h2 className="font-serif text-lg text-white mb-5">🌍 Top destinations (par nombre de voyages)</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topDestinations.map((dest, i) => (
            <div key={dest.id}
              className="bg-white/3 border border-white/5 rounded-xl p-4 text-center hover:border-[#C9A84C]/20 transition-all">
              <span className="text-2xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
              <p className="text-white text-sm font-medium mt-2 truncate">{dest.name}</p>
              <p className="text-white/40 text-xs">{dest._count.voyages} voyage(s)</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
