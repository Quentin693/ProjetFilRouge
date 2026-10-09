"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateReservationStatusAction } from "@/actions/admin-voyage";

interface Reservation {
  id: string;
  reference: string;
  status: string;
  adults: number;
  children: number;
  totalPrice: number;
  createdAt: Date;
  user: { name: string | null; email: string | null };
  voyage: { title: string; slug: string };
  departure: { departDate: Date; returnDate: Date };
  payment: { status: string } | null;
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

function StatusCell({ res }: { res: Reservation }) {
  const [isPending, startTransition] = useTransition();
  const handleChange = (val: string | null) => {
    if (!val || val === res.status) return;
    startTransition(async () => {
      await updateReservationStatusAction(res.id, val as "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED");
      toast.success(`Statut → ${STATUS_LABELS[val]}`);
    });
  };
  return (
    <Select value={res.status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-7 w-36 bg-white/5 border-white/10 text-white/70 text-xs focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#1A1A1A] border-white/10">
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <SelectItem key={val} value={val} className="text-white/70 focus:bg-white/10 focus:text-white text-xs">{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminReservationsTable({ reservations }: { reservations: Reservation[] }) {
  if (reservations.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/5 rounded-xl p-16 text-center">
        <p className="text-white/30">Aucune réservation pour ce filtre.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Référence", "Client", "Voyage", "Départ", "Voyageurs", "Montant", "Paiement", "Statut"].map((h) => (
                <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider py-3 px-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reservations.map((res) => (
              <tr key={res.id} className="hover:bg-white/2 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-[#C9A84C] font-mono text-xs">#{res.reference.slice(0, 8).toUpperCase()}</span>
                  <p className="text-white/30 text-xs">{new Date(res.createdAt).toLocaleDateString("fr-FR")}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-white text-sm">{res.user.name}</p>
                  <p className="text-white/40 text-xs">{res.user.email}</p>
                </td>
                <td className="py-3 px-4 max-w-[180px]">
                  <Link href={`/admin/voyages`} className="text-white/80 text-sm hover:text-white truncate block">
                    {res.voyage.title}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <p className="text-white/60 text-xs whitespace-nowrap">
                    {new Date(res.departure.departDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-white/60 text-sm">{res.adults + res.children}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[#C9A84C] font-medium text-sm">{res.totalPrice.toLocaleString("fr-FR")} €</span>
                </td>
                <td className="py-3 px-4">
                  <Badge className={res.payment?.status === "PAID"
                    ? "bg-green-500/10 text-green-400 border-green-500/20 text-xs"
                    : "bg-white/5 text-white/40 border-white/10 text-xs"
                  }>
                    {res.payment?.status === "PAID" ? "Payé ✓" : "Non payé"}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <StatusCell res={res} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
