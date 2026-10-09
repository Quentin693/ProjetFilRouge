import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VoyageForm } from "@/components/admin/voyage-form";
import { DepartureManager } from "@/components/admin/departure-manager";
import { VoyageReservations } from "@/components/admin/voyage-reservations";
import { updateVoyageAction } from "@/actions/admin-voyage";

export const metadata: Metadata = { title: "Admin — Détail voyage" };

const categoryLabels: Record<string, string> = {
  LUXURY: "Luxe",
  PREMIUM: "Premium",
  ADVENTURE: "Aventure",
  HONEYMOON: "Lune de miel",
  FAMILY: "Famille",
  SOLO: "Solo",
};

export default async function AdminVoyageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [voyage, destinations] = await Promise.all([
    prisma.voyage.findUnique({
      where: { id },
      include: {
        destination: true,
        departures: {
          orderBy: { departDate: "asc" },
        },
        reservations: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, email: true } },
            departure: { select: { departDate: true, returnDate: true } },
            payment: { select: { status: true, amount: true } },
          },
        },
      },
    }),
    prisma.destination.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, country: true },
    }),
  ]);

  if (!voyage) notFound();

  const updateAction = updateVoyageAction.bind(null, voyage.id);

  const totalSeats = voyage.departures.filter((d) => d.active).reduce((s, d) => s + d.seatsTotal, 0);
  const bookedSeats = voyage.departures.filter((d) => d.active).reduce((s, d) => s + d.seatsBooked, 0);
  const fillPct = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/voyages"
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl text-white">{voyage.title}</h1>
              <Badge className={categoryLabels[voyage.category] ? "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20" : "bg-white/10 text-white/60 border-white/10"}>
                {categoryLabels[voyage.category] || voyage.category}
              </Badge>
              {!voyage.active && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Inactif</Badge>
              )}
            </div>
            <p className="text-white/40 text-sm">
              {voyage.destination.name}, {voyage.destination.country}
            </p>
          </div>
        </div>
        <Link
          href={`/voyages/${voyage.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 text-[#C9A84C]/60 hover:text-[#C9A84C] text-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Page publique
        </Link>
      </div>

      {/* Hero Card */}
      <div className="relative h-48 rounded-xl overflow-hidden">
        <Image src={voyage.imageUrl} alt={voyage.title} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6 gap-8">
          <div>
            <p className="text-white/50 text-xs mb-1">Durée</p>
            <p className="text-white font-medium">{voyage.duration} jours</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Prix de base</p>
            <p className="text-[#C9A84C] font-medium">{voyage.basePrice.toLocaleString("fr-FR")} €</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Places actives</p>
            <p className="text-white font-medium">{totalSeats - bookedSeats} / {totalSeats} dispo.</p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Remplissage</p>
            <p className={`font-medium ${fillPct >= 90 ? "text-red-400" : fillPct >= 70 ? "text-orange-400" : "text-green-400"}`}>
              {fillPct}%
            </p>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Réservations</p>
            <p className="text-white font-medium">{voyage.reservations.length}</p>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left : Edit form */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
            <h2 className="font-serif text-lg text-white mb-5">Modifier le voyage</h2>
            <VoyageForm
              destinations={destinations}
              action={updateAction}
              voyage={{
                ...voyage,
                category: voyage.category as string,
              }}
              submitLabel="Enregistrer les modifications"
            />
          </div>
        </div>

        {/* Right : Departures + Reservations */}
        <div className="xl:col-span-3 space-y-6">
          {/* Departures */}
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-white">Départs & Places</h2>
              <span className="text-white/40 text-xs">
                {voyage.departures.filter((d) => d.active && new Date(d.departDate) > new Date()).length} départ(s) à venir
              </span>
            </div>
            <DepartureManager
              voyageId={voyage.id}
              departures={voyage.departures.map((d) => ({
                ...d,
                priceChild: d.priceChild ?? null,
              }))}
            />
          </div>

          {/* Reservations */}
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
            <h2 className="font-serif text-lg text-white mb-5">
              Réservations
              {voyage.reservations.length > 0 && (
                <span className="ml-2 text-sm text-white/40 font-sans font-normal">
                  ({voyage.reservations.length})
                </span>
              )}
            </h2>
            {voyage.reservations.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">
                Aucune réservation pour ce voyage.
              </p>
            ) : (
              <VoyageReservations
                reservations={voyage.reservations.map((r) => ({
                  ...r,
                  payment: r.payment
                    ? { status: r.payment.status, amount: r.payment.amount }
                    : null,
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
