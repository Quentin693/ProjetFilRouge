import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, EyeOff, Users, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleVoyageActiveAction } from "@/actions/admin-voyage";

export const metadata: Metadata = { title: "Admin — Voyages" };

const categoryLabels: Record<string, string> = {
  LUXURY: "Luxe",
  PREMIUM: "Premium",
  ADVENTURE: "Aventure",
  HONEYMOON: "Lune de miel",
  FAMILY: "Famille",
  SOLO: "Solo",
};

export default async function AdminVoyagesPage() {
  const voyages = await prisma.voyage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true, country: true } },
      departures: { where: { active: true } },
      _count: { select: { reservations: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white">Gestion des Voyages</h1>
          <p className="text-white/40 text-sm mt-1">
            {voyages.length} voyage{voyages.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/admin/voyages/new">
          <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold gap-2">
            <Plus className="w-4 h-4" />
            Créer un voyage
          </Button>
        </Link>
      </div>

      {/* Voyages Grid */}
      {voyages.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-16 text-center">
          <p className="text-white/40 mb-4">Aucun voyage pour le moment.</p>
          <Link href="/admin/voyages/new">
            <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black">
              <Plus className="w-4 h-4 mr-2" /> Créer le premier voyage
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {voyages.map((voyage) => {
            const nextDeparture = voyage.departures
              .filter((d) => new Date(d.departDate) > new Date())
              .sort((a, b) => new Date(a.departDate).getTime() - new Date(b.departDate).getTime())[0];

            const totalSeats = voyage.departures.reduce((s, d) => s + d.seatsTotal, 0);
            const bookedSeats = voyage.departures.reduce((s, d) => s + d.seatsBooked, 0);

            return (
              <div
                key={voyage.id}
                className={`bg-[#111111] border rounded-xl overflow-hidden transition-all hover:border-[#C9A84C]/30 ${
                  voyage.active ? "border-white/5" : "border-red-500/20 opacity-70"
                }`}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={voyage.imageUrl}
                    alt={voyage.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-black/60 text-[#C9A84C] border-[#C9A84C]/30 text-xs backdrop-blur-sm">
                      {categoryLabels[voyage.category] || voyage.category}
                    </Badge>
                    {voyage.featured && (
                      <Badge className="bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30 text-xs">
                        ✦ Mis en avant
                      </Badge>
                    )}
                  </div>
                  {!voyage.active && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Inactif
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-serif text-lg text-white mb-0.5 leading-tight">{voyage.title}</h3>
                  <p className="text-white/40 text-xs mb-3">
                    {voyage.destination.name}, {voyage.destination.country}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {voyage.duration} jours
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {voyage._count.reservations} rés.
                    </span>
                    <span className="flex items-center gap-1 text-[#C9A84C]">
                      <Star className="w-3 h-3" />
                      {voyage.basePrice.toLocaleString("fr-FR")} €
                    </span>
                  </div>

                  {/* Departures Summary */}
                  <div className="bg-white/3 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Départs actifs</span>
                      <span className="text-white font-medium">{voyage.departures.length}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Places totales</span>
                      <span className="text-white font-medium">{totalSeats}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Remplissage</span>
                      <span className={totalSeats > 0 && bookedSeats / totalSeats > 0.8 ? "text-orange-400 font-medium" : "text-white font-medium"}>
                        {totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0}%
                      </span>
                    </div>
                    {nextDeparture && (
                      <div className="flex justify-between text-xs mt-1 pt-1 border-t border-white/5">
                        <span className="text-white/50">Prochain départ</span>
                        <span className="text-[#C9A84C]">
                          {new Date(nextDeparture.departDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/admin/voyages/${voyage.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-xs"
                      >
                        Gérer
                      </Button>
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await toggleVoyageActiveAction(voyage.id, !voyage.active);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className={`border-white/10 text-xs px-3 ${
                          voyage.active
                            ? "text-white/40 hover:text-red-400 hover:border-red-400/30"
                            : "text-green-400 hover:border-green-400/30"
                        }`}
                        title={voyage.active ? "Désactiver" : "Activer"}
                      >
                        {voyage.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </form>
                    <Link href={`/voyages/${voyage.slug}`} target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-white/40 hover:text-[#C9A84C] hover:border-[#C9A84C]/30 text-xs px-3"
                        title="Voir la page publique"
                      >
                        ↗
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
