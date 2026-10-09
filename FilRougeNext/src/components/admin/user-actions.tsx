"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { toggleUserRoleAction, deleteUserAction } from "@/actions/admin-user";

export function AdminUserActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggleRole = () => {
    startTransition(async () => {
      try {
        await toggleUserRoleAction(userId, currentRole);
        toast.success(currentRole === "ADMIN" ? "Rôle repassé à Utilisateur" : "Promu Administrateur");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Supprimer définitivement cet utilisateur et toutes ses données ?")) return;
    startTransition(async () => {
      try {
        await deleteUserAction(userId);
        toast.success("Utilisateur supprimé.");
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleRole}
        disabled={isPending}
        className={`h-7 px-3 border-white/10 text-xs gap-1.5 ${
          currentRole === "ADMIN"
            ? "text-orange-400 hover:border-orange-400/30 hover:bg-orange-400/5"
            : "text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/5"
        }`}
        title={currentRole === "ADMIN" ? "Retirer les droits admin" : "Promouvoir admin"}
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : currentRole === "ADMIN" ? (
          <><ShieldOff className="w-3 h-3" /> Rétrograder</>
        ) : (
          <><ShieldAlert className="w-3 h-3" /> Promouvoir</>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="h-7 w-7 p-0 border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/30"
        title="Supprimer l'utilisateur"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
