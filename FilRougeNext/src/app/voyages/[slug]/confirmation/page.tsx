import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConfirmationPage } from "@/components/booking/confirmation-page";
import { MarketingNav } from "@/components/layout/marketing-nav";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reservation?: string }>;
}

export const metadata: Metadata = { title: "Réservation confirmée !" };

export default async function ConfirmationPageRoute({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { reservation: reservationId } = await searchParams;
  if (!reservationId) redirect("/dashboard");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId, userId: session.user.id },
    include: {
      voyage: { include: { destination: true } },
      departure: true,
      payment: true,
    },
  });

  if (!reservation) notFound();

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <MarketingNav />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">
        <ConfirmationPage reservation={reservation} />
      </div>
    </div>
  );
}
