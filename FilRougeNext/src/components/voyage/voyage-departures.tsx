"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Departure {
  id: string;
  departDate: Date;
  returnDate: Date;
  seatsTotal: number;
  seatsBooked: number;
  priceAdult: number;
  priceChild: number | null;
}

interface Props {
  departures: Departure[];
  voyageSlug: string;
  voyageTitle: string;
  basePrice: number;
}

export function VoyageDepartures({ departures, voyageSlug, basePrice }: Props) {
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(
    departures[0]?.id ?? null
  );

  const selected = departures.find((d) => d.id === selectedDeparture);
  const seatsLeft = selected
    ? selected.seatsTotal - selected.seatsBooked
    : 0;

  if (departures.length === 0) {
    return (
      <div className="sticky top-24">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-yellow-400 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Aucun départ disponible</span>
          </div>
          <p className="text-white/40 text-sm mb-6">
            Il n&apos;y a pas de départ planifié pour ce voyage actuellement.
            Contactez-nous pour un voyage sur mesure.
          </p>
          <Button className="w-full bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold">
            Nous contacter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 space-y-4">
      {/* Price Box */}
      <div className="bg-[#111111] border border-[#C9A84C]/20 rounded-2xl p-6">
        <div className="text-center mb-6 pb-6 border-b border-white/5">
          <p className="text-white/40 text-sm mb-1">À partir de</p>
          <p className="font-serif text-4xl text-[#C9A84C] font-semibold">
            {basePrice.toLocaleString("fr-FR")} €
          </p>
          <p className="text-white/30 text-sm">par personne, tout inclus</p>
        </div>

        {/* Departures */}
        <div className="space-y-3 mb-6">
          <p className="text-white/50 text-xs uppercase tracking-widest font-medium">
            Choisissez votre départ
          </p>
          {departures.map((dep) => {
            const seats = dep.seatsTotal - dep.seatsBooked;
            const isFull = seats === 0;
            const isSelected = dep.id === selectedDeparture;

            return (
              <button
                key={dep.id}
                onClick={() => !isFull && setSelectedDeparture(dep.id)}
                disabled={isFull}
                className={cn(
                  "w-full p-3.5 rounded-xl border text-left transition-all duration-200",
                  isSelected
                    ? "border-[#C9A84C] bg-[#C9A84C]/5"
                    : isFull
                    ? "border-white/5 opacity-40 cursor-not-allowed"
                    : "border-white/10 hover:border-[#C9A84C]/40 hover:bg-white/2"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#C9A84C]" />}
                    <span className="text-white text-sm font-medium">
                      {new Date(dep.departDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="font-serif text-[#C9A84C] text-sm font-semibold">
                    {dep.priceAdult.toLocaleString("fr-FR")} €
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/40 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Retour{" "}
                      {new Date(dep.returnDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {seats} place{seats > 1 ? "s" : ""}
                    </div>
                  </div>
                  {seats <= 3 && seats > 0 && (
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                      Dernières places
                    </Badge>
                  )}
                  {isFull && (
                    <Badge className="bg-white/5 text-white/30 border-white/10 text-xs">
                      Complet
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        {selected && (
          <Link href={`/voyages/${voyageSlug}/reserver?departure=${selected.id}`}>
            <Button className="w-full h-13 bg-[#C9A84C] hover:bg-[#A07830] text-black font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2">
              Réserver ce départ
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}

        <p className="text-white/25 text-xs text-center mt-3">
          Annulation gratuite jusqu&apos;à 30 jours avant le départ
        </p>
      </div>

      {/* Trust Box */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 space-y-3">
        {[
          "✓ Paiement 100% sécurisé",
          "✓ Prix tout inclus, pas de frais cachés",
          "✓ Assistance 24/7 pendant le voyage",
          "✓ Équipe francophone sur place",
        ].map((item, i) => (
          <p key={i} className="text-white/40 text-xs">
            {item}
          </p>
        ))}
      </div>

      {/* Seats Warning */}
      {selected && seatsLeft <= 4 && seatsLeft > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">
            <strong>Attention !</strong> Il ne reste que{" "}
            <strong>{seatsLeft} place{seatsLeft > 1 ? "s" : ""}</strong> pour ce départ.
          </p>
        </div>
      )}
    </div>
  );
}
