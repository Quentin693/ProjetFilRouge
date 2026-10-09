import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

interface FeaturedVoyage {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  basePrice: number;
  duration: number;
  destination: {
    name: string;
    country: string;
    rating: number;
    reviewCount: number;
  };
}

interface FeaturedDestinationsProps {
  voyages: FeaturedVoyage[];
}

export async function FeaturedDestinations({ voyages }: FeaturedDestinationsProps) {
  const t = await getTranslations("destinations");
  const featured = voyages.slice(0, 4);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[#0D0D0D]" id="destinations">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            {t("sectionLabel")}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white mt-3 mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">{t("sectionDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="lg:col-span-2 lg:row-span-2 relative group rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[480px] cursor-pointer">
            <Image
              src={featured[0].imageUrl}
              alt={featured[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30 mb-3">
                ✦ {t("favorite")}
              </Badge>
              <h3 className="font-serif text-3xl text-white mb-1">{featured[0].title}</h3>
              <p className="text-white/60 text-sm mb-3">
                {featured[0].destination.name}, {featured[0].destination.country} ·{" "}
                {featured[0].duration} jours
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#C9A84C]" fill="#C9A84C" />
                  <span className="text-white text-sm font-medium">
                    {featured[0].destination.rating}
                  </span>
                  <span className="text-white/40 text-xs">
                    ({featured[0].destination.reviewCount})
                  </span>
                </div>
                <span className="text-[#C9A84C] font-serif text-lg">
                  {t("from")}{" "}
                  <strong>{featured[0].basePrice.toLocaleString("fr-FR")}€</strong>
                </span>
              </div>
            </div>
            <Link href={`/voyages/${featured[0].slug}`} className="absolute inset-0" />
          </div>

          {featured.slice(1, 4).map((voyage) => (
            <div
              key={voyage.id}
              className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
            >
              <Image
                src={voyage.imageUrl}
                alt={voyage.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-xl text-white line-clamp-2">{voyage.title}</h3>
                <p className="text-white/50 text-xs mb-2">
                  {voyage.destination.name}, {voyage.destination.country}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#C9A84C]" fill="#C9A84C" />
                    <span className="text-white text-xs">{voyage.destination.rating}</span>
                  </div>
                  <span className="text-[#C9A84C] text-xs font-medium">
                    {voyage.basePrice.toLocaleString("fr-FR")}€{t("perPerson")}
                  </span>
                </div>
              </div>
              <Link href={`/voyages/${voyage.slug}`} className="absolute inset-0" />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/voyages">
            <Button
              variant="outline"
              className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black tracking-widest uppercase"
            >
              {t("viewAll")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
