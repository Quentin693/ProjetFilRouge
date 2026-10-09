"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, ArrowLeft, ArrowRight, Users, FileText, CreditCard, Loader2, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createReservationAction } from "@/actions/booking";
import { toast } from "sonner";

interface Voyage {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  duration: number;
  destination: { name: string; country: string };
}

interface Departure {
  id: string;
  departDate: Date;
  returnDate: Date;
  priceAdult: number;
  priceChild: number | null;
}

interface PassengerData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
}

const STEPS = [
  { id: 1, label: "Voyageurs", icon: Users },
  { id: 2, label: "Passagers", icon: FileText },
  { id: 3, label: "Paiement", icon: CreditCard },
];

export function BookingWizard({ voyage, departure, seatsLeft, userId }: {
  voyage: Voyage;
  departure: Departure;
  seatsLeft: number;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [passengers, setPassengers] = useState<PassengerData[]>([
    { firstName: "", lastName: "", dateOfBirth: "", passportNumber: "" },
  ]);
  const [specialRequests, setSpecialRequests] = useState("");

  const totalPassengers = adults + children;
  const priceChild = departure.priceChild || departure.priceAdult * 0.7;
  const totalPrice = adults * departure.priceAdult + children * priceChild;

  const nights = Math.round(
    (new Date(departure.returnDate).getTime() - new Date(departure.departDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Sync passengers array with adults + children count
  const updatePassengersCount = (newAdults: number, newChildren: number) => {
    const total = newAdults + newChildren;
    setPassengers((prev) => {
      if (total > prev.length) {
        return [
          ...prev,
          ...Array(total - prev.length).fill({
            firstName: "", lastName: "", dateOfBirth: "", passportNumber: "",
          }),
        ];
      }
      return prev.slice(0, total);
    });
  };

  const updatePassenger = (index: number, field: keyof PassengerData, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createReservationAction({
        voyageId: voyage.id,
        departureId: departure.id,
        adults,
        children,
        passengers,
        specialRequests,
      });
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          {voyage.destination.name}, {voyage.destination.country}
        </div>
        <h1 className="font-serif text-4xl text-white">{voyage.title}</h1>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;

          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isDone
                      ? "bg-[#C9A84C] border-[#C9A84C]"
                      : isActive
                      ? "border-[#C9A84C] bg-[#C9A84C]/10"
                      : "border-white/10 bg-white/2"
                  )}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-black" />
                  ) : (
                    <Icon className={cn("w-4 h-4", isActive ? "text-[#C9A84C]" : "text-white/30")} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 font-medium",
                    isActive ? "text-[#C9A84C]" : isDone ? "text-white/60" : "text-white/20"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mb-5 mx-2", isDone ? "bg-[#C9A84C]" : "bg-white/5")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">

          {/* STEP 1 — Voyageurs */}
          {step === 1 && (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-6">
              <h2 className="font-serif text-2xl text-white">Nombre de voyageurs</h2>
              <p className="text-white/40 text-sm">
                Places disponibles pour ce départ :{" "}
                <span className="text-[#C9A84C] font-semibold">{seatsLeft}</span>
              </p>

              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                  <div>
                    <p className="text-white font-medium">Adultes</p>
                    <p className="text-white/40 text-sm">
                      {departure.priceAdult.toLocaleString("fr-FR")} € / personne
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (adults > 1) {
                          setAdults(adults - 1);
                          updatePassengersCount(adults - 1, children);
                        }
                      }}
                      className="w-9 h-9 rounded-full border border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors flex items-center justify-center font-bold"
                    >
                      −
                    </button>
                    <span className="font-serif text-2xl text-white w-6 text-center">{adults}</span>
                    <button
                      onClick={() => {
                        if (adults + children < seatsLeft && adults + children < 10) {
                          setAdults(adults + 1);
                          updatePassengersCount(adults + 1, children);
                        }
                      }}
                      className="w-9 h-9 rounded-full border border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                  <div>
                    <p className="text-white font-medium">Enfants</p>
                    <p className="text-white/40 text-sm">
                      {priceChild.toLocaleString("fr-FR")} € / enfant (−30%)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (children > 0) {
                          setChildren(children - 1);
                          updatePassengersCount(adults, children - 1);
                        }
                      }}
                      className="w-9 h-9 rounded-full border border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors flex items-center justify-center font-bold"
                    >
                      −
                    </button>
                    <span className="font-serif text-2xl text-white w-6 text-center">{children}</span>
                    <button
                      onClick={() => {
                        if (adults + children < seatsLeft && adults + children < 10) {
                          setChildren(children + 1);
                          updatePassengersCount(adults, children + 1);
                        }
                      }}
                      className="w-9 h-9 rounded-full border border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label className="text-white/50 text-sm">Demandes particulières (optionnel)</Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Régime alimentaire, accessibilité, préférences de chambre..."
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C] resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Passagers */}
          {step === 2 && (
            <div className="space-y-4">
              {passengers.map((p, i) => (
                <div key={i} className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                      <span className="text-[#C9A84C] text-xs font-semibold">{i + 1}</span>
                    </div>
                    <h3 className="font-serif text-lg text-white">
                      {i < adults ? `Adulte ${i + 1}` : `Enfant ${i - adults + 1}`}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/50 text-sm">Prénom *</Label>
                      <Input
                        value={p.firstName}
                        onChange={(e) => updatePassenger(i, "firstName", e.target.value)}
                        placeholder="Jean"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/50 text-sm">Nom *</Label>
                      <Input
                        value={p.lastName}
                        onChange={(e) => updatePassenger(i, "lastName", e.target.value)}
                        placeholder="Dupont"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/50 text-sm">Date de naissance *</Label>
                      <Input
                        type="date"
                        value={p.dateOfBirth}
                        onChange={(e) => updatePassenger(i, "dateOfBirth", e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white focus:border-[#C9A84C] [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/50 text-sm">N° Passeport *</Label>
                      <Input
                        value={p.passportNumber}
                        onChange={(e) => updatePassenger(i, "passportNumber", e.target.value)}
                        placeholder="FR12345678"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C] uppercase"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3 — Paiement */}
          {step === 3 && (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-6">
              <h2 className="font-serif text-2xl text-white">Paiement sécurisé</h2>

              {/* Demo Banner */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm font-medium mb-1">🎭 Mode démonstration</p>
                <p className="text-blue-400/70 text-xs">
                  Ce paiement est simulé. Aucun vrai débit ne sera effectué.
                  Cliquez sur "Confirmer" pour valider votre réservation.
                </p>
              </div>

              {/* Card Form (visuel seulement) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Numéro de carte</Label>
                  <Input
                    defaultValue="4111 1111 1111 1111"
                    className="bg-white/5 border-white/10 text-white font-mono focus:border-[#C9A84C]"
                    maxLength={19}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">Date d&apos;expiration</Label>
                    <Input
                      defaultValue="12/28"
                      className="bg-white/5 border-white/10 text-white font-mono focus:border-[#C9A84C]"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/50 text-sm">CVV</Label>
                    <Input
                      defaultValue="123"
                      className="bg-white/5 border-white/10 text-white font-mono focus:border-[#C9A84C]"
                      maxLength={3}
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50 text-sm">Nom sur la carte</Label>
                  <Input
                    defaultValue={`${passengers[0]?.firstName} ${passengers[0]?.lastName}`.trim() || "JEAN DUPONT"}
                    className="bg-white/5 border-white/10 text-white uppercase focus:border-[#C9A84C]"
                    readOnly
                  />
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total à régler</span>
                  <span className="font-serif text-2xl text-[#C9A84C] font-semibold">
                    {totalPrice.toLocaleString("fr-FR")} €
                  </span>
                </div>
                <p className="text-white/30 text-xs mt-1">
                  Paiement sécurisé — vos données sont protégées
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => {
                  // Validation step 2
                  if (step === 2) {
                    const allFilled = passengers.every(
                      (p) => p.firstName && p.lastName && p.dateOfBirth && p.passportNumber
                    );
                    if (!allFilled) {
                      toast.error("Veuillez remplir toutes les informations passagers.");
                      return;
                    }
                  }
                  setStep((s) => s + 1);
                }}
                className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold"
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-bold px-8"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirmer et payer {totalPrice.toLocaleString("fr-FR")} €
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Booking Summary (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
            {/* Image */}
            <div className="relative h-40">
              <Image
                src={voyage.imageUrl}
                alt={voyage.title}
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
            </div>

            <div className="p-5 space-y-4">
              <h3 className="font-serif text-lg text-white">{voyage.title}</h3>
              <p className="text-white/40 text-xs">
                {voyage.destination.name}, {voyage.destination.country}
              </p>

              {/* Details */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-white/50">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
                    Départ
                  </div>
                  <span className="text-white text-xs">
                    {new Date(departure.departDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-white/50">
                    <Clock className="w-3.5 h-3.5 text-[#C9A84C]" />
                    Durée
                  </div>
                  <span className="text-white text-xs">{nights} nuits</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-white/50">
                    <Users className="w-3.5 h-3.5 text-[#C9A84C]" />
                    Voyageurs
                  </div>
                  <span className="text-white text-xs">
                    {adults} adulte{adults > 1 ? "s" : ""}
                    {children > 0 && `, ${children} enfant${children > 1 ? "s" : ""}`}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">
                    {adults} adulte{adults > 1 ? "s"  : ""} × {departure.priceAdult.toLocaleString("fr-FR")} €
                  </span>
                  <span className="text-white">{(adults * departure.priceAdult).toLocaleString("fr-FR")} €</span>
                </div>
                {children > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">
                      {children} enfant{children > 1 ? "s" : ""} × {priceChild.toLocaleString("fr-FR")} €
                    </span>
                    <span className="text-white">{(children * priceChild).toLocaleString("fr-FR")} €</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-white/5">
                  <span className="text-white">Total</span>
                  <span className="font-serif text-lg text-[#C9A84C]">
                    {totalPrice.toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>

              {/* Security */}
              <div className="text-center">
                <p className="text-white/20 text-xs">🔒 Paiement 100% sécurisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
