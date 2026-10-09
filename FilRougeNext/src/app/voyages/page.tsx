import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Star, Clock, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Nos Voyages",
  description: "Découvrez toute notre sélection de voyages d'exception",
};

async function getVoyages() {
  try {
    return await prisma.voyage.findMany({
      where: { active: true },
      include: {
        destination: true,
        departures: {
          where: { active: true, departDate: { gte: new Date() } },
          orderBy: { departDate: "asc" },
          take: 1,
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

const categoryLabels: Record<string, string> = {
  LUXURY: "Luxe",
  PREMIUM: "Premium",
  ADVENTURE: "Aventure",
  HONEYMOON: "Lune de miel",
  FAMILY: "Famille",
  SOLO: "Solo",
};

export default async function VoyagesPage() {
  const dbVoyages = await getVoyages();

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <MarketingNav />

      {/* Hero */}
      <div className="relative pt-32 pb-16 text-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80&auto=format&fit=crop"
            alt="Bali"
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/70 to-[#0D0D0D]" />
        </div>
        <div className="relative z-10">
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            Collection exclusive
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-white mt-3 mb-4">
            Nos Voyages d&apos;Exception
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Des expériences soigneusement sélectionnées pour les voyageurs les plus exigeants
          </p>
          {dbVoyages.length > 0 && (
            <p className="text-white/30 text-sm mt-3">
              {dbVoyages.length} voyage{dbVoyages.length > 1 ? "s" : ""} disponible
              {dbVoyages.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <section className="container mx-auto px-6 pb-20">
        {dbVoyages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">Aucun voyage disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbVoyages.map((voyage) => (
              <div
                key={voyage.id}
                className="group bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={voyage.imageUrl}
                    alt={voyage.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {voyage.featured && (
                      <Badge className="bg-[#C9A84C] text-black text-xs border-0">
                        ✦ Coup de cœur
                      </Badge>
                    )}
                    <Badge className="bg-black/40 backdrop-blur-sm text-white border-white/20 text-xs">
                      {categoryLabels[voyage.category] || voyage.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-lg text-white mb-1">{voyage.title}</h3>
                  <p className="text-white/40 text-xs mb-3">
                    {voyage.destination.name}, {voyage.destination.country}
                  </p>

                  <div className="flex items-center gap-4 text-white/50 text-xs mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {voyage.duration} jours
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Max. {voyage.maxGuests} pers.
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#C9A84C]" fill="#C9A84C" />
                      {voyage.destination.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <p className="text-white/30 text-xs">À partir de</p>
                      <p className="text-[#C9A84C] font-serif text-lg font-medium">
                        {voyage.basePrice.toLocaleString("fr-FR")} €
                        <span className="text-white/30 text-xs font-normal">/pers.</span>
                      </p>
                    </div>
                    <Link href={`/voyages/${voyage.slug}`}>
                      <div className="w-9 h-9 rounded-full border border-[#C9A84C]/30 flex items-center justify-center group-hover:bg-[#C9A84C] group-hover:border-[#C9A84C] transition-all">
                        <ArrowRight className="w-4 h-4 text-[#C9A84C] group-hover:text-black" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
