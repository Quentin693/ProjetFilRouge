import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Users, MapPin, ArrowLeft, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryLabels: Record<string, string> = {
  LUXURY: "Luxe",
  PREMIUM: "Premium",
  ADVENTURE: "Aventure",
  HONEYMOON: "Lune de miel",
  FAMILY: "Famille",
  SOLO: "Solo",
};

interface Voyage {
  title: string;
  category: string;
  imageUrl: string;
  duration: number;
  maxGuests: number;
  basePrice: number;
  featured: boolean;
  destination: { name: string; country: string; rating: number; reviewCount: number };
  departures: { seatsTotal: number; seatsBooked: number }[];
}

export function VoyageHero({ voyage }: { voyage: Voyage }) {
  const seatsLeft = voyage.departures.reduce(
    (acc, d) => acc + (d.seatsTotal - d.seatsBooked),
    0
  );

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <Image
        src={voyage.imageUrl}
        alt={voyage.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-[#0D0D0D]/70" />

      {/* Back Button */}
      <div className="absolute top-24 left-6 z-10">
        <Link
          href="/voyages"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tous les voyages
        </Link>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div className="container mx-auto">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-[#C9A84C] text-black border-0 font-semibold">
              {categoryLabels[voyage.category] || voyage.category}
            </Badge>
            {voyage.featured && (
              <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20">
                ✦ Coup de cœur
              </Badge>
            )}
            {seatsLeft <= 4 && seatsLeft > 0 && (
              <Badge className="bg-red-500/80 text-white border-0 animate-pulse">
                🔥 Plus que {seatsLeft} place{seatsLeft > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 leading-tight">
            {voyage.title}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-2 text-white/60 mb-6">
            <MapPin className="w-4 h-4 text-[#C9A84C]" />
            <span>{voyage.destination.name}, {voyage.destination.country}</span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#C9A84C]" fill="#C9A84C" />
              <span className="text-white font-semibold">{voyage.destination.rating}</span>
              <span className="text-white/40 text-sm">({voyage.destination.reviewCount} avis)</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Clock className="w-4 h-4 text-[#C9A84C]" />
              <span>{voyage.duration} jours</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Users className="w-4 h-4 text-[#C9A84C]" />
              <span>Max. {voyage.maxGuests} personnes</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Award className="w-4 h-4 text-[#C9A84C]" />
              <span>Agence certifiée ATOUT FRANCE</span>
            </div>

            {/* Price */}
            <div className="ml-auto text-right">
              <p className="text-white/40 text-xs">À partir de</p>
              <p className="font-serif text-3xl text-[#C9A84C] font-semibold">
                {voyage.basePrice.toLocaleString("fr-FR")} €
                <span className="text-white/40 text-sm font-normal">/pers.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
