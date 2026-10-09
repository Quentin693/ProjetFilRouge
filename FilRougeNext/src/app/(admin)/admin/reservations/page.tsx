import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminReservationsTable } from "@/components/admin/reservations-table";

export const metadata: Metadata = { title: "Admin — Réservations" };

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as never } : {}),
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
      voyage: { select: { title: true, slug: true } },
      departure: { select: { departDate: true, returnDate: true } },
      payment: { select: { status: true } },
    },
  });

  const counts = await prisma.reservation.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((s, c) => s + c._count, 0);

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ALL: { label: "Toutes", color: "bg-white/10 text-white/70" },
    PENDING: { label: "En attente", color: "bg-yellow-500/10 text-yellow-400" },
    CONFIRMED: { label: "Confirmées", color: "bg-green-500/10 text-green-400" },
    CANCELLED: { label: "Annulées", color: "bg-red-500/10 text-red-400" },
    COMPLETED: { label: "Terminées", color: "bg-blue-500/10 text-blue-400" },
    REFUNDED: { label: "Remboursées", color: "bg-purple-500/10 text-purple-400" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Toutes les Réservations</h1>
        <p className="text-white/40 text-sm mt-1">{total} réservation(s) au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = key === "ALL" ? total : (countMap[key] ?? 0);
          const isActive = (status ?? "ALL") === key;
          return (
            <Link key={key} href={`/admin/reservations?status=${key}${q ? `&q=${q}` : ""}`}>
              <button className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isActive ? "bg-[#C9A84C] text-black border-[#C9A84C]" : `${cfg.color} border-white/10 hover:border-white/20`
              }`}>
                {cfg.label} ({count})
              </button>
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Chercher par référence, client, voyage…"
          className="flex-1 h-10 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-4 text-sm focus:border-[#C9A84C] focus:outline-none"
        />
        {status && <input type="hidden" name="status" value={status} />}
        <button type="submit" className="px-4 h-10 bg-[#C9A84C] hover:bg-[#A07830] text-black text-sm font-semibold rounded-lg transition-colors">
          Rechercher
        </button>
        {q && (
          <Link href={`/admin/reservations${status ? `?status=${status}` : ""}`}
            className="px-4 h-10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-colors flex items-center">
            Effacer
          </Link>
        )}
      </form>

      {/* Table */}
      <AdminReservationsTable reservations={reservations} />
    </div>
  );
}
