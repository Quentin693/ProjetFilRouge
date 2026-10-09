import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight, Globe } from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { LUXURY_DESTINATIONS } from "@/lib/data/destinations";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Nos Destinations",
  description: "Explorez nos destinations de luxe à travers le monde : Maldives, Santorin, Bali, Dubaï, Kyoto...",
};

const continentColors: Record<string, string> = {
  Asie: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Europe: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Moyen-Orient": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Afrique: "bg-green-500/10 text-green-400 border-green-500/20",
  Amériques: "bg-red-500/10 text-red-400 border-red-500/20",
};

const continents = [...new Set(LUXURY_DESTINATIONS.map((d) => d.continent))];

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <MarketingNav />

      {/* Hero */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80&auto=format&fit=crop"
            alt="Kyoto"
            fill
            className="object-cover opacity-15"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/60 to-[#0D0D0D]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full px-4 py-2 mb-6">
            <Globe className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-[#C9A84C] text-sm font-medium">
              {LUXURY_DESTINATIONS.length} destinations d&apos;exception
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-5">
            Le Monde dans toute sa Splendeur
          </h1>
          <p className="text-white/50 text-lg">
            Des îles paradisiaques aux cités impériales, en passant par les déserts dorés —
            chaque destination est une promesse d&apos;émerveillement.
          </p>
        </div>
      </div>

      {/* Filter by Continent */}
      <div className="container mx-auto px-6 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/destinations" className="px-4 py-2 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium">
            Toutes
          </Link>
          {continents.map((c) => (
            <span
              key={c}
              className={`px-4 py-2 rounded-full border text-sm font-medium ${continentColors[c] || "bg-white/5 text-white/50 border-white/10"}`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LUXURY_DESTINATIONS.map((dest, i) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.id}`}
              className="group relative bg-[#111111] border border-white/5 hover:border-[#C9A84C]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#C9A84C]/5"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={dest.imageUrl}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={i < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Continent Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={`${continentColors[dest.continent] || ""} text-xs`}>
                    {dest.continent}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="w-3 h-3 text-[#C9A84C]" fill="#C9A84C" />
                  <span className="text-white text-xs font-medium">{dest.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-xl text-white group-hover:text-[#C9A84C] transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-white/40 text-sm">{dest.country}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-[#C9A84C] group-hover:bg-[#C9A84C] flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-black" />
                  </div>
                </div>

                <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-4">
                  {dest.tagline}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {dest.highlights.slice(0, 3).map((h, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Price & Reviews */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 text-white/30 text-xs">
                    <Star className="w-3 h-3 text-[#C9A84C]" fill="#C9A84C" />
                    {dest.reviewCount.toLocaleString()} avis
                  </div>
                  <div>
                    <span className="text-white/30 text-xs">À partir de </span>
                    <span className="text-[#C9A84C] font-serif font-semibold">
                      {dest.basePrice.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
