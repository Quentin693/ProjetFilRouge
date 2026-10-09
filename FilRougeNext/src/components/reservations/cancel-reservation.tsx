"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cancelReservationAction } from "@/actions/booking";
import { useRouter } from "next/navigation";

export function CancelReservation({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.")) return;

    startTransition(async () => {
      const result = await cancelReservationAction(reservationId);
      if (result?.success) {
        toast.success("Réservation annulée. Votre remboursement sera traité sous 5-7 jours.");
        router.refresh();
      } else {
        toast.error(result?.error || "Erreur lors de l'annulation.");
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleCancel}
      disabled={isPending}
      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <X className="w-4 h-4 mr-2" />
          Annuler la réservation
        </>
      )}
    </Button>
  );
}
