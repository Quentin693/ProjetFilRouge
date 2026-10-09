"use client";

import Image from "next/image";
import { useState } from "react";
import { Calendar, MapPin, Users, CreditCard, Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Reservation {
  id: string;
  reference: string;
  status: string;
  totalPrice: number;
  adults: number;
  children: number;
  createdAt: Date;
  voyage: {
    title: string;
    imageUrl: string;
    duration: number;
    destination: { name: string; country: string };
  };
  departure: { departDate: Date; returnDate: Date };
  payment: { status: string } | null;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  CONFIRMED: { label: "Confirmée", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELLED: { label: "Annulée", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  COMPLETED: { label: "Terminée", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  REFUNDED: { label: "Remboursée", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
};

function ReservationCard({ res }: { res: Reservation }) {
  const status = statusConfig[res.status] || statusConfig.PENDING;
  const isUpcoming = new Date(res.departure.departDate) > new Date();
  const nights = Math.round(
    (new Date(res.departure.returnDate).getTime() -
      new Date(res.departure.departDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 rounded-xl overflow-hidden transition-all duration-300 group">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
          <Image
            src={res.voyage.imageUrl}
            alt={res.voyage.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 192px"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-serif text-lg text-white">{res.voyage.title}</h3>
              <div className="flex items-center gap-1 text-white/40 text-sm mt-0.5">
                <MapPin className="w-3 h-3" />
                {res.voyage.destination.name}, {res.voyage.destination.country}
              </div>
            </div>
            <Badge className={`${status.class} ml-3`}>{status.label}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-white/30 text-xs mb-1">Départ</p>
              <div className="flex items-center gap-1 text-white text-sm">
                <Calendar className="w-3 h-3 text-[#C9A84C]" />
                {new Date(res.departure.departDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <p className="text-white/30 text-xs mb-1">Durée</p>
              <div className="flex items-center gap-1 text-white text-sm">
                <Clock className="w-3 h-3 text-[#C9A84C]" />
                {nights} nuits
              </div>
            </div>
            <div>
              <p className="text-white/30 text-xs mb-1">Voyageurs</p>
              <div className="flex items-center gap-1 text-white text-sm">
                <Users className="w-3 h-3 text-[#C9A84C]" />
                {res.adults} adulte{res.adults > 1 ? "s" : ""}
                {res.children > 0 && `, ${res.children} enfant${res.children > 1 ? "s" : ""}`}
              </div>
            </div>
            <div>
              <p className="text-white/30 text-xs mb-1">Total</p>
              <div className="flex items-center gap-1 text-[#C9A84C] text-sm font-medium">
                <CreditCard className="w-3 h-3" />
                {res.totalPrice.toLocaleString("fr-FR")} €
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-white/30 text-xs font-mono">
              Réf. #{res.reference.slice(0, 8).toUpperCase()}
            </span>
            <div className="flex gap-2">
              {res.status === "CONFIRMED" && isUpcoming && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs"
                >
                  Annuler
                </Button>
              )}
              <Link href={`/reservations/${res.id}`}>
                <Button
                  size="sm"
                  className="bg-[#C9A84C] hover:bg-[#A07830] text-black text-xs"
                >
                  Voir détail
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReservationsList({ reservations }: { reservations: Reservation[] }) {
  const [search, setSearch] = useState("");

  const filtered = reservations.filter((r) =>
    r.voyage.title.toLowerCase().includes(search.toLowerCase()) ||
    r.voyage.destination.name.toLowerCase().includes(search.toLowerCase()) ||
    r.voyage.destination.country.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter(
    (r) => r.status === "CONFIRMED" && new Date(r.departure.departDate) > new Date()
  );
  const past = filtered.filter(
    (r) =>
      r.status === "COMPLETED" ||
      (r.status === "CONFIRMED" && new Date(r.departure.departDate) <= new Date())
  );
  const pending = filtered.filter((r) => r.status === "PENDING");
  const cancelled = filtered.filter(
    (r) => r.status === "CANCELLED" || r.status === "REFUNDED"
  );
  

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-6">
          <Calendar className="w-9 h-9 text-[#C9A84C]" />
        </div>
        <h3 className="font-serif text-2xl text-white mb-2">Aucune réservation</h3>
        <p className="text-white/40 mb-6 max-w-sm">
          Vous n&apos;avez pas encore effectué de réservation. Explorez nos destinations
          et commencez votre aventure !
        </p>
        <Link href="/voyages">
          <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black">
            Explorer les voyages
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom de voyage, destination…"
            className="pl-9 bg-[#111111] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C9A84C]/50 focus-visible:border-[#C9A84C]/40"
          />
        </div>
        <TabsList className="bg-[#111111] border border-white/5 rounded-xl p-1 gap-1">
          <TabsTrigger value="all" className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg">
            Toutes ({reservations.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg">
            À venir ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg">
            En attente ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg">
            Passées ({past.length + cancelled.length})
          </TabsTrigger>
        </TabsList>




      </div>



      <TabsContent value="all" className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-white/40 text-center py-10">Aucun résultat pour &quot;{search}&quot;</p>
        ) : (
          filtered.map((res) => <ReservationCard key={res.id} res={res} />)
        )}
      </TabsContent>
      <TabsContent value="upcoming" className="space-y-4">
        {upcoming.length === 0 ? (
          <p className="text-white/40 text-center py-10">Aucun voyage à venir</p>
        ) : (
          upcoming.map((res) => <ReservationCard key={res.id} res={res} />)
        )}
      </TabsContent>
      <TabsContent value="pending" className="space-y-4">
        {pending.length === 0 ? (
          <p className="text-white/40 text-center py-10">Aucune réservation en attente</p>
        ) : (
          pending.map((res) => <ReservationCard key={res.id} res={res} />)
        )}
      </TabsContent>
      <TabsContent value="past" className="space-y-4">
        {[...past, ...cancelled].length === 0 ? (
          <p className="text-white/40 text-center py-10">Aucun voyage passé</p>
        ) : (
          [...past, ...cancelled].map((res) => <ReservationCard key={res.id} res={res} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
