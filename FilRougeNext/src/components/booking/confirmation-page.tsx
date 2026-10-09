"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Users, CreditCard, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { processPaymentAction } from "@/actions/booking";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ReservationQrCode } from "@/components/booking/reservation-qr-code";

interface Reservation {
  id: string;
  reference: string;
  status: string;
  adults: number;
  children: number;
  totalPrice: number;
  specialRequests: string | null;
  voyage: {
    title: string;
    imageUrl: string;
    slug: string;
    destination: { name: string; country: string };
  };
  departure: { departDate: Date; returnDate: Date };
  payment: { status: string; transactionId: string | null } | null;
}

export function ConfirmationPage({ reservation }: { reservation: Reservation }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPaid, setIsPaid] = useState(reservation.status === "CONFIRMED");

  const nights = Math.round(
    (new Date(reservation.departure.returnDate).getTime() -
      new Date(reservation.departure.departDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handlePayment = () => {
    startTransition(async () => {
      const result = await processPaymentAction(reservation.id);
      if (result?.success) {
        setIsPaid(true);
        toast.success("Paiement validé ! Votre réservation est confirmée. 🎉");
        router.refresh();
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
          isPaid ? "bg-green-500/10" : "bg-yellow-500/10"
        }`}>
          <CheckCircle className={`w-10 h-10 ${isPaid ? "text-green-400" : "text-yellow-400"}`} />
        </div>

        {isPaid ? (
          <>
            <h1 className="font-serif text-4xl text-white mb-3">
              🎉 Réservation confirmée !
            </h1>
            <p className="text-white/50 max-w-lg mx-auto">
              Votre aventure est officiellement réservée. Vous allez recevoir un email
              de confirmation avec tous les détails.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl text-white mb-3">
              Récapitulatif de votre réservation
            </h1>
            <p className="text-white/50 max-w-lg mx-auto">
              Votre réservation est en attente de paiement. Confirmez pour finaliser votre voyage.
            </p>
          </>
        )}
      </div>

      {/* Reservation Card */}
      <div className="bg-[#111111] border border-[#C9A84C]/20 rounded-2xl overflow-hidden">
        {/* Image Header */}
        <div className="relative h-48">
          <Image
            src={reservation.voyage.imageUrl}
            alt={reservation.voyage.title}
            fill
            className="object-cover"
            sizes="800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />

          {/* Reference Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-[#C9A84C] text-black font-mono font-bold border-0 text-sm">
              #{reservation.reference.slice(0, 8).toUpperCase()}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-5">
            <h2 className="font-serif text-2xl text-white">{reservation.voyage.title}</h2>
            <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
              {reservation.voyage.destination.name}, {reservation.voyage.destination.country}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Départ</p>
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
              {new Date(reservation.departure.departDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Retour</p>
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
              {new Date(reservation.departure.returnDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}
              {" "}({nights} nuits)
            </div>
          </div>

          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Voyageurs</p>
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
              {reservation.adults} adulte{reservation.adults > 1 ? "s" : ""}
              {reservation.children > 0 && `, ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}`}
            </div>
          </div>

          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Total payé</p>
            <div className="flex items-center gap-1.5 text-[#C9A84C] font-serif text-lg font-semibold">
              {reservation.totalPrice.toLocaleString("fr-FR")} €
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="px-6 pb-6">
          <div className={`rounded-xl p-4 border ${
            isPaid
              ? "bg-green-500/5 border-green-500/20"
              : "bg-yellow-500/5 border-yellow-500/20"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isPaid ? "text-green-400" : "text-yellow-400"}`}>
                  {isPaid ? "✓ Réservation confirmée & payée" : "⏳ En attente de paiement"}
                </p>
                {reservation.payment?.transactionId && (
                  <p className="text-white/30 text-xs mt-0.5 font-mono">
                    Txn: {reservation.payment.transactionId}
                  </p>
                )}
              </div>
              <Badge className={isPaid
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              }>
                {isPaid ? "Confirmée" : "En attente"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Action or Done */}
      {!isPaid ? (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-[#C9A84C]" />
            <h3 className="font-serif text-xl text-white">Finaliser le paiement</h3>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              🎭 <strong>Mode démo</strong> — Le paiement est simulé.
              Cliquez ci-dessous pour confirmer instantanément votre réservation.
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <span className="text-white/60">Montant total</span>
            <span className="font-serif text-2xl text-[#C9A84C] font-semibold">
              {reservation.totalPrice.toLocaleString("fr-FR")} €
            </span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isPending}
            className="w-full h-13 bg-[#C9A84C] hover:bg-[#A07830] text-black font-bold text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Traitement du paiement...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Confirmer le paiement — {reservation.totalPrice.toLocaleString("fr-FR")} €
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400 mb-4">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">Votre aventure vous attend !</p>
          </div>
          <p className="text-white/50 text-sm">
            Un email de confirmation avec votre voucher de voyage, les détails pratiques
            et les coordonnées de notre équipe sur place vous a été envoyé.
          </p>
        </div>
      )}

      {isPaid && (
        <ReservationQrCode
          reservationId={reservation.id}
          reference={reservation.reference}
          voyageTitle={reservation.voyage.title}
        />
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/reservations">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Mes réservations
          </Button>
        </Link>

        {isPaid && (
          <Button
            variant="outline"
            className="border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/5"
            onClick={() =>
              window.open(
                `/api/reservations/${reservation.id}/pdf?token=${reservation.reference.slice(0, 8).toUpperCase()}`,
                "_blank"
              )
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger le voucher (PDF)
          </Button>
        )}

        <Link href="/voyages">
          <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold">
            Explorer d&apos;autres voyages
          </Button>
        </Link>
      </div>
    </div>
  );
}
