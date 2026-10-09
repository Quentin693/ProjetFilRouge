import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, MapPin, Users, CreditCard, ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelReservation } from "@/components/reservations/cancel-reservation";
import { ReservationQrCode } from "@/components/booking/reservation-qr-code";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Détail de la réservation" };

const statusConfig: Record<string, { label: string; class: string }> = {
  PENDING: { label: "En attente de paiement", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  CONFIRMED: { label: "Confirmée", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELLED: { label: "Annulée", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  COMPLETED: { label: "Voyage terminé", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  REFUNDED: { label: "Remboursée", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
};

export default async function ReservationDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id, userId: session.user.id },
    include: {
      voyage: { include: { destination: true } },
      departure: true,
      payment: true,
    },
  });

  if (!reservation) notFound();

  const status = statusConfig[reservation.status] || statusConfig.PENDING;
  const nights = Math.round(
    (new Date(reservation.departure.returnDate).getTime() -
      new Date(reservation.departure.departDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const isUpcoming =
    reservation.status === "CONFIRMED" &&
    new Date(reservation.departure.departDate) > new Date();

  const passengers = reservation.passengers as Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    passportNumber: string;
  }> | null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes réservations
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">Réservation</h1>
            <p className="text-white/40 font-mono text-sm mt-1">
              #{reservation.reference.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge className={`${status.class} text-sm px-3 py-1.5`}>{status.label}</Badge>
        </div>
      </div>

      {/* Voyage Card */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="relative h-52">
          <Image
            src={reservation.voyage.imageUrl}
            alt={reservation.voyage.title}
            fill
            className="object-cover"
            sizes="800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <h2 className="font-serif text-2xl text-white">{reservation.voyage.title}</h2>
            <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
              {reservation.voyage.destination.name}, {reservation.voyage.destination.country}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Départ</p>
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
              {new Date(reservation.departure.departDate).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Retour</p>
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
              {new Date(reservation.departure.returnDate).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long",
              })}
              {" "}({nights} nuits)
            </div>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Voyageurs</p>
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
              {reservation.adults} adulte{reservation.adults > 1 ? "s" : ""}
              {reservation.children > 0 && `, ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}`}
            </div>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Total</p>
            <div className="flex items-center gap-1.5 text-[#C9A84C] font-serif text-lg font-semibold">
              {reservation.totalPrice.toLocaleString("fr-FR")} €
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
        <h3 className="font-serif text-xl text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#C9A84C]" />
          Paiement
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/30 text-xs mb-1">Montant</p>
            <p className="text-white font-semibold">{reservation.totalPrice.toLocaleString("fr-FR")} €</p>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">Statut</p>
            <p className={`font-medium text-sm ${
              reservation.payment?.status === "PAID" ? "text-green-400" : "text-yellow-400"
            }`}>
              {reservation.payment?.status === "PAID" ? "Payé ✓" : "En attente"}
            </p>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">Devise</p>
            <p className="text-white">EUR €</p>
          </div>
          {reservation.payment?.transactionId && (
            <div>
              <p className="text-white/30 text-xs mb-1">Transaction</p>
              <p className="text-white/60 text-xs font-mono">{reservation.payment.transactionId}</p>
            </div>
          )}
        </div>

        {/* Pay Now if Pending */}
        {reservation.status === "PENDING" && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <Link href={`/voyages/${reservation.voyage.slug}/confirmation?reservation=${reservation.id}`}>
              <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold">
                Finaliser le paiement →
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Passengers */}
      {passengers && passengers.length > 0 && (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
          <h3 className="font-serif text-xl text-white mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C9A84C]" />
            Passagers ({passengers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passengers.map((p, i) => (
              <div key={i} className="bg-white/2 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <span className="text-[#C9A84C] text-xs font-semibold">{i + 1}</span>
                  </div>
                  <span className="text-white font-medium">
                    {i < reservation.adults ? `Adulte ${i + 1}` : `Enfant ${i - reservation.adults + 1}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/30 text-xs mb-0.5">Prénom</p>
                    <p className="text-white">{p.firstName}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-0.5">Nom</p>
                    <p className="text-white">{p.lastName}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-0.5">Date de naissance</p>
                    <p className="text-white/70">{p.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-0.5">N° Passeport</p>
                    <p className="text-white/70 uppercase font-mono">{p.passportNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Requests */}
      {reservation.specialRequests && (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
          <h3 className="font-serif text-xl text-white mb-3">Demandes particulières</h3>
          <p className="text-white/50 text-sm">{reservation.specialRequests}</p>
        </div>
      )}

      {(reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") && (
        <ReservationQrCode
          reservationId={reservation.id}
          reference={reservation.reference}
          voyageTitle={reservation.voyage.title}
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/reservations">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Retour aux réservations
          </Button>
        </Link>
        {isUpcoming && <CancelReservation reservationId={reservation.id} />}
      </div>
    </div>
  );
}
