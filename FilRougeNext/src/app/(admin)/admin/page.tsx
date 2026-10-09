import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Users, Calendar, MapPin, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — Vue d'ensemble",
};

async function getAdminStats() {
  const [
    totalUsers,
    totalReservations,
    totalVoyages,
    pendingReservations,
    recentReservations,
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
  ]);

  const revenue = await prisma.reservation.aggregate({
    _sum: { totalPrice: true },
    where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
  });

  return {
    totalUsers,
    totalReservations,
    totalVoyages,
    pendingReservations,
    totalRevenue: revenue._sum.totalPrice || 0,
    recentReservations,
  };
}

const statusLabels: Record<string, { label: string; class: string }> = {
  PENDING: { label: "En attente", class: "text-yellow-400" },
  CONFIRMED: { label: "Confirmée", class: "text-green-400" },
  CANCELLED: { label: "Annulée", class: "text-red-400" },
  COMPLETED: { label: "Terminée", class: "text-blue-400" },
};

export default async function AdminPage() {
  const stats = await getAdminStats();

  const cards = [
    { title: "Utilisateurs", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Réservations", value: stats.totalReservations, icon: Calendar, color: "text-green-400", bg: "bg-green-400/10" },
    { title: "Voyages actifs", value: stats.totalVoyages, icon: MapPin, color: "text-[#C9A84C]", bg: "bg-[#C9A84C]/10" },
    { title: "Revenu total", value: `${stats.totalRevenue.toLocaleString("fr-FR")} €`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white">Vue d&apos;ensemble</h1>
          <p className="text-white/40 text-sm mt-1">
            {stats.pendingReservations} réservation(s) en attente de confirmation
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#111111] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/50 text-sm">{card.title}</p>
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="font-serif text-2xl text-white font-medium">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Reservations */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <h2 className="font-serif text-xl text-white mb-6">Réservations Récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Client", "Voyage", "Montant", "Date", "Statut"].map((h) => (
                  <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentReservations.map((res: { id: string; status: string; totalPrice: number; createdAt: Date; user: { name: string | null; email: string | null }; voyage: { title: string } }) => {
                const status = statusLabels[res.status] || statusLabels.PENDING;
                return (
                  <tr key={res.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-white text-sm">{res.user.name}</p>
                      <p className="text-white/40 text-xs">{res.user.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-white/70 text-sm">{res.voyage.title}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-[#C9A84C] text-sm font-medium">
                        {res.totalPrice.toLocaleString("fr-FR")} €
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-white/50 text-sm">
                        {new Date(res.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
