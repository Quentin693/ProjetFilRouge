import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { MarketingNav } from "@/components/layout/marketing-nav";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ departure?: string }>;
}

export const metadata: Metadata = { title: "Réserver votre voyage" };

export default async function ReservationPage({ params, searchParams }: Props) {
  const session = await auth();
  const { slug } = await params;
  const { departure: departureId } = await searchParams;

  if (!session) {
    redirect(`/login?callbackUrl=/voyages/${slug}/reserver?departure=${departureId}`);
  }

  const voyage = await prisma.voyage.findUnique({
    where: { slug, active: true },
    include: { destination: true },
  });

  if (!voyage) notFound();

  if (!departureId) redirect(`/voyages/${slug}`);

  const departure = await prisma.departure.findUnique({
    where: { id: departureId, active: true, voyageId: voyage.id },
  });

  if (!departure) redirect(`/voyages/${slug}`);

  const seatsLeft = departure.seatsTotal - departure.seatsBooked;
  if (seatsLeft <= 0) redirect(`/voyages/${slug}`);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <MarketingNav />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        <BookingWizard
          voyage={voyage}
          departure={departure}
          seatsLeft={seatsLeft}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
