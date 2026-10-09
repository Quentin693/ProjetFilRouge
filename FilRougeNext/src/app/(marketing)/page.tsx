import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturedDestinations } from "@/components/marketing/featured-destinations";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { StatsSection } from "@/components/marketing/stats-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Voyage Luxe — Destinations d'Exception",
  description:
    "Réservez des voyages d'exception dans les destinations les plus luxueuses du monde. Maldives, Santorin, Bali, Dubaï et bien plus encore.",
};

async function getFeaturedVoyages() {
  try {
    return await prisma.voyage.findMany({
      where: { featured: true, active: true },
      include: {
        destination: {
          select: {
            name: true,
            country: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const dbVoyages = await getFeaturedVoyages();

  return (
    <>
      <HeroSection />
      <FeaturedDestinations voyages={dbVoyages} />
      <StatsSection />
      <HowItWorks />
      <Testimonials />
      <CtaSection />
    </>
  );
}
