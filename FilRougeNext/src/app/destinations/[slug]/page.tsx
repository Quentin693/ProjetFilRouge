import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Users, ArrowRight, MapPin, Check } from "lucide-react";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { LUXURY_DESTINATIONS } from "@/lib/data/destinations";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = LUXURY_DESTINATIONS.find((d) => d.id === slug);
  if (!dest) return { title: "Destination introuvable" };

  return {
    title: `${dest.name} — Voyages de luxe`,
    description: dest.description,
    openGraph: { title: dest.name, images: [dest.imageUrl] },
  };
}

async function getVoyagesForDestination(destinationName: string) {
  try {
    const dest = await prisma.destination.findFirst({
      where: { name: { contains: destinationName, mode: "insensitive" } },
    });
    if (!dest) return [];

    return prisma.voyage.findMany({
      where: { destinationId: dest.id, active: true },
      include: {
        destination: true,
        departures: {
          where: { active: true, departDate: { gte: new Date() } },
          orderBy: { departDate: "asc" },
          take: 1,
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const dest = LUXURY_DESTINATIONS.find((d) => d.id === slug);

  if (!dest) notFound();

  const voyages = await getVoyagesForDestination(dest.name);

  const categoryLabels: Record<string, string> = {
    LUXURY: "Luxe",
    PREMIUM: "Premium",
    ADVENTURE: "Aventure",
    HONEYMOON: "Lune de miel",
    FAMILY: "Famille",
    SOLO: "Solo",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <MarketingNav />

      {/* Hero */}
      <div className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <Image
          src={dest.imageUrl}
          alt={dest.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-[#0D0D0D]/60" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
              <Link href="/destinations" className="hover:text-[#C9A84C] transition-colors">
                Destinations
              </Link>
              <span>/</span>
              <span className="text-white">{dest.name}</span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl text-white mb-3">{dest.name}</h1>
            <p className="font-serif text-2xl text-[#C9A84C] mb-6">{dest.tagline}</p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#C9A84C]" fill="#C9A84C" />
                <span className="text-white font-semibold">{dest.rating}</span>
                <span className="text-white/40 text-sm">({dest.reviewCount.toLocaleString()} avis)</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <MapPin className="w-4 h-4 text-[#C9A84C]" />
                {dest.country} · {dest.continent}
              </div>
              <div className="ml-auto">
                <p className="text-white/40 text-sm">À partir de</p>
                <p className="font-serif text-3xl text-[#C9A84C] font-semibold">
                  {dest.basePrice.toLocaleString("fr-FR")} €
                  <span className="text-white/30 text-sm font-normal">/pers.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <h2 className="font-serif text-3xl text-white mb-5">À propos</h2>
              <p className="text-white/60 text-lg leading-relaxed">{dest.description}</p>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="font-serif text-3xl text-white mb-5">Points forts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dest.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-[#111111] border border-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-[#C9A84C]" />
                    </div>
                    <span className="text-white/70">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voyages Available */}
            {voyages.length > 0 && (
              <div>
                <h2 className="font-serif text-3xl text-white mb-6">
                  Nos voyages à {dest.name}
                </h2>
                <div className="space-y-4">
                  {voyages.map((voyage) => (
                    <div
                      key={voyage.id}
                      className="group bg-[#111111] border border-white/5 hover:border-[#C9A84C]/20 rounded-2xl overflow-hidden transition-all"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-48 h-40 shrink-0">
                          <Image
                            src={voyage.imageUrl}
                            alt={voyage.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="200px"
                          />
                        </div>
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20 text-xs mb-2">
                                {categoryLabels[voyage.category] || voyage.category}
                              </Badge>
                              <h3 className="font-serif text-lg text-white">{voyage.title}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-white/40 text-xs mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {voyage.duration} jours
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Max. {voyage.maxGuests} pers.
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-serif text-lg text-[#C9A84C]">
                              À partir de{" "}
                              <strong>{voyage.basePrice.toLocaleString("fr-FR")} €</strong>
                            </p>
                            <Link href={`/voyages/${voyage.slug}`}>
                              <Button
                                size="sm"
                                className="bg-[#C9A84C] hover:bg-[#A07830] text-black text-xs"
                              >
                                Voir le voyage
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Quick Info */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="font-serif text-xl text-white mb-5">Informations pratiques</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/40 text-sm">Pays</span>
                  <span className="text-white text-sm">{dest.country}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/40 text-sm">Continent</span>
                  <span className="text-white text-sm">{dest.continent}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/40 text-sm">Durée recommandée</span>
                  <span className="text-white text-sm">{dest.duration} jours</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-white/40 text-sm">Note voyageurs</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#C9A84C]" fill="#C9A84C" />
                    <span className="text-white text-sm font-semibold">{dest.rating}/5</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-white/40 text-sm">Prix de départ</span>
                  <span className="text-[#C9A84C] font-serif font-semibold">
                    {dest.basePrice.toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>

              <Link href="/voyages" className="block mt-5">
                <Button className="w-full bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold">
                  Voir tous les voyages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Destinations */}
      <div className="container mx-auto px-6 pb-20">
        <h2 className="font-serif text-3xl text-white mb-8">Destinations similaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {LUXURY_DESTINATIONS.filter((d) => d.id !== dest.id)
            .slice(0, 3)
            .map((related) => (
              <Link
                key={related.id}
                href={`/destinations/${related.id}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3]"
              >
                <Image
                  src={related.imageUrl}
                  alt={related.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="font-serif text-white font-medium">{related.name}</p>
                  <p className="text-white/50 text-xs">{related.country}</p>
                </div>
              </Link>
            ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
