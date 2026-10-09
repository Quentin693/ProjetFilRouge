import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationsList } from "@/components/reservations/reservations-list";

export const metadata: Metadata = {
  title: "Mes Réservations",
};

async function getUserReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    include: {
      voyage: { include: { destination: true } },
      departure: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ReservationsPage() {
  const session = await auth();
  if (!session) return null;

  const reservations = await getUserReservations(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Mes Réservations</h1>
        <p className="text-white/40 text-sm mt-1">
          {reservations.length} réservation{reservations.length > 1 ? "s" : ""} au total
        </p>
      </div>

      <ReservationsList reservations={reservations} />
    </div>
  );
}
