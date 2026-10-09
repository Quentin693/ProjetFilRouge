"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
}

interface BookingData {
  voyageId: string;
  departureId: string;
  adults: number;
  children: number;
  passengers: PassengerInfo[];
  specialRequests: string;
}

export async function createReservationAction(data: BookingData) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  const { voyageId, departureId, adults, children, passengers, specialRequests } = data;

  // Vérifier que le départ existe encore et a des places
  const departure = await prisma.departure.findUnique({
    where: { id: departureId, active: true },
  });

  if (!departure) return { error: "Ce départ n'existe plus." };

  const seatsNeeded = adults + children;
  const seatsLeft = departure.seatsTotal - departure.seatsBooked;

  if (seatsLeft < seatsNeeded) {
    return { error: `Seulement ${seatsLeft} place(s) disponible(s).` };
  }

  // Calculer le prix total
  const totalPrice =
    adults * departure.priceAdult +
    children * (departure.priceChild || departure.priceAdult * 0.7);

  // Créer la réservation dans une transaction
  const reservation = await prisma.$transaction(async (tx) => {
    // Incrémenter les places réservées
    await tx.departure.update({
      where: { id: departureId },
      data: { seatsBooked: { increment: seatsNeeded } },
    });

    // Créer la réservation
    const res = await tx.reservation.create({
      data: {
        userId: session.user.id,
        voyageId,
        departureId,
        adults,
        children,
        totalPrice,
        specialRequests: specialRequests || null,
        passengers: passengers as unknown as import("@prisma/client").Prisma.JsonArray,
        status: "PENDING",
      },
    });

    // Créer le paiement simulé (pending)
    await tx.payment.create({
      data: {
        reservationId: res.id,
        amount: totalPrice,
        currency: "EUR",
        status: "PENDING",
        method: "card",
      },
    });

    return res;
  });

  // Récupérer le slug du voyage pour la redirection
  const voyage = await prisma.voyage.findUnique({ where: { id: voyageId }, select: { slug: true } });
  revalidatePath("/dashboard");
  revalidatePath("/reservations");
  revalidatePath(`/voyages/${voyage?.slug}`);
  redirect(`/voyages/${voyage?.slug}/confirmation?reservation=${reservation.id}`);
}

export async function processPaymentAction(reservationId: string) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId, userId: session.user.id },
    include: { payment: true },
  });

  if (!reservation) return { error: "Réservation introuvable." };
  if (reservation.status !== "PENDING") return { error: "Cette réservation a déjà été traitée." };

  // Simuler le paiement (toujours accepté en mode démo)
  await prisma.$transaction([
    prisma.payment.update({
      where: { reservationId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        transactionId: `TXN-${Date.now()}`,
      },
    }),
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${reservationId}`);
  return { success: true, reservationId };
}

export async function cancelReservationAction(reservationId: string) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId, userId: session.user.id },
    include: { departure: true },
  });

  if (!reservation) return { error: "Réservation introuvable." };

  const validStatuses = ["PENDING", "CONFIRMED"];
  if (!validStatuses.includes(reservation.status)) {
    return { error: "Cette réservation ne peut plus être annulée." };
  }

  const isUpcoming = new Date(reservation.departure.departDate) > new Date();
  if (!isUpcoming) return { error: "Impossible d'annuler un voyage déjà passé." };

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    }),
    prisma.departure.update({
      where: { id: reservation.departureId },
      data: {
        seatsBooked: {
          decrement: reservation.adults + reservation.children,
        },
      },
    }),
    ...(reservation.status === "CONFIRMED"
      ? [
          prisma.payment.update({
            where: { reservationId },
            data: { status: "REFUNDED" },
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${reservationId}`);
  return { success: true };
}
