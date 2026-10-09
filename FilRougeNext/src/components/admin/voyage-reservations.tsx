"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { updateReservationStatusAction } from "@/actions/admin-voyage";

interface Reservation {
  id: string;
  reference: string;
  status: string;
  adults: number;
  children: number;
  totalPrice: number;
  specialRequests: string | null;
  createdAt: Date;
  user: { name: string | null; email: string | null };
  departure: { departDate: Date; returnDate: Date };
  payment: { status: string; amount: number } | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
  REFUNDED: "Remboursée",
};

const STATUS_OPTIONS = ["CONFIRMED", "PENDING", "CANCELLED", "COMPLETED", "REFUNDED"] as const;

function ReservationRow({ res }: { res: Reservation }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleStatusChange = (status: string | null) => {
    if (!status || status === res.status) return;
    startTransition(async () => {
      await updateReservationStatusAction(
        res.id,
        status as "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED"
      );
      toast.success(`Statut mis à jour : ${STATUS_LABELS[status]}`);
    });
  };

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#C9A84C] font-mono text-xs">
              #{res.reference.slice(0, 8).toUpperCase()}
            </span>
            <Badge className={`${STATUS_STYLES[res.status]} text-xs`}>
              {STATUS_LABELS[res.status]}
            </Badge>
            {res.payment?.status === "PAID" && (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                💳 Payé
              </Badge>
            )}
          </div>
          <p className="text-white text-sm font-medium truncate">{res.user.name}</p>
          <p className="text-white/40 text-xs">{res.user.email}</p>
        </div>

        <div className="hidden md:flex flex-col items-end text-xs text-white/50 gap-1 shrink-0">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(res.departure.departDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {res.adults + res.children} voyageur{res.adults + res.children > 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1 text-[#C9A84C] font-medium">
            <CreditCard className="w-3 h-3" />
            {res.totalPrice.toLocaleString("fr-FR")} €
          </span>
        </div>

        {/* Status changer */}
        <div className="shrink-0 w-36" onClick={(e) => e.stopPropagation()}>
          <Select
            value={res.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white/70 text-xs focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-white/70 focus:bg-white/10 focus:text-white text-xs">
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/5 bg-white/2 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Détail réservation</p>
            <ul className="space-y-1 text-white/60 text-xs">
              <li>Départ : <span className="text-white">{new Date(res.departure.departDate).toLocaleDateString("fr-FR")}</span></li>
              <li>Retour : <span className="text-white">{new Date(res.departure.returnDate).toLocaleDateString("fr-FR")}</span></li>
              <li>Adultes : <span className="text-white">{res.adults}</span></li>
              <li>Enfants : <span className="text-white">{res.children}</span></li>
              <li>Total : <span className="text-[#C9A84C] font-medium">{res.totalPrice.toLocaleString("fr-FR")} €</span></li>
              <li>Réservé le : <span className="text-white">{new Date(res.createdAt).toLocaleDateString("fr-FR")}</span></li>
            </ul>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Paiement</p>
            <ul className="space-y-1 text-white/60 text-xs">
              <li>Statut : <span className={res.payment?.status === "PAID" ? "text-green-400" : "text-yellow-400"}>
                {res.payment?.status === "PAID" ? "Payé ✓" : "En attente"}
              </span></li>
              {res.payment?.amount && (
                <li>Montant : <span className="text-white">{res.payment.amount.toLocaleString("fr-FR")} €</span></li>
              )}
            </ul>
            {res.specialRequests && (
              <>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1 mt-3">Demandes particulières</p>
                <p className="text-white/60 text-xs italic">{res.specialRequests}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function VoyageReservations({ reservations }: { reservations: Reservation[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? reservations : reservations.filter((r) => r.status === filter);
  const total = reservations.reduce((s, r) => s + r.totalPrice, 0);
  const confirmed = reservations.filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED").reduce((s, r) => s + r.totalPrice, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/3 rounded-xl p-3 text-center">
          <p className="font-serif text-xl text-white">{reservations.length}</p>
          <p className="text-white/40 text-xs">Réservations</p>
        </div>
        <div className="bg-white/3 rounded-xl p-3 text-center">
          <p className="font-serif text-xl text-[#C9A84C]">{total.toLocaleString("fr-FR")} €</p>
          <p className="text-white/40 text-xs">Revenu total</p>
        </div>
        <div className="bg-white/3 rounded-xl p-3 text-center">
          <p className="font-serif text-xl text-green-400">{confirmed.toLocaleString("fr-FR")} €</p>
          <p className="text-white/40 text-xs">Confirmé / encaissé</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s
                ? "bg-[#C9A84C] text-black"
                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            {s === "ALL" ? "Toutes" : STATUS_LABELS[s]}
            {s === "ALL"
              ? ` (${reservations.length})`
              : ` (${reservations.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">Aucune réservation pour ce filtre.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((res) => (
            <ReservationRow key={res.id} res={res} />
          ))}
        </div>
      )}
    </div>
  );
}
