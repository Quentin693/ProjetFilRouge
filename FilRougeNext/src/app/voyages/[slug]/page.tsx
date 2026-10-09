import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { VoyageHero } from "@/components/voyage/voyage-hero";
import { VoyageDetails } from "@/components/voyage/voyage-details";
import { VoyageDepartures } from "@/components/voyage/voyage-departures";
import { VoyageReviews } from "@/components/voyage/voyage-reviews";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getVoyage(slug: string) {
  return prisma.voyage.findUnique({
    where: { slug, active: true },
    include: {
      destination: true,
      departures: {
        where: { active: true, departDate: { gte: new Date() } },
        orderBy: { departDate: "asc" },
      },
    },
  });
}

async function getReviews(voyageId: string) {
  return prisma.review.findMany({
    where: { voyageId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const voyage = await getVoyage(slug);
  if (!voyage) return { title: "Voyage introuvable" };

  return {
    title: voyage.title,
    description: voyage.description.slice(0, 160),
    openGraph: {
      title: voyage.title,
      description: voyage.description.slice(0, 160),
      images: [voyage.imageUrl],
    },
  };
}

export default async function VoyageDetailPage({ params }: Props) {
  const { slug } = await params;
  const voyage = await getVoyage(slug);

  if (!voyage) notFound();

  const reviews = await getReviews(voyage.id);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <MarketingNav />

      {/* Hero */}
      <VoyageHero voyage={voyage} />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left — Details */}
          <div className="lg:col-span-2 space-y-12">
            <VoyageDetails voyage={voyage} />
            <VoyageReviews reviews={reviews} rating={voyage.destination.rating} />
          </div>

          {/* Right — Sticky Booking */}
          <div className="lg:col-span-1">
            <VoyageDepartures
              departures={voyage.departures}
              voyageSlug={voyage.slug}
              voyageTitle={voyage.title}
              basePrice={voyage.basePrice}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
