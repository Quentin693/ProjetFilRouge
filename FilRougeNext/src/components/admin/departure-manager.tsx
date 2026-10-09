"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  addDepartureAction,
  deleteDepartureAction,
  toggleDepartureActiveAction,
  updateDepartureSeatsAction,
  type DepartureActionState,
} from "@/actions/admin-voyage";

interface Departure {
  id: string;
  departDate: Date;
  returnDate: Date;
  seatsTotal: number;
  seatsBooked: number;
  priceAdult: number;
  priceChild: number | null;
  active: boolean;
}

const emptyState: DepartureActionState = {};

export function DepartureManager({
  voyageId,
  departures,
}: {
  voyageId: string;
  departures: Departure[];
}) {
  const addAction = addDepartureAction.bind(null, voyageId);
  const [state, formAction, isPending] = useActionState(addAction, emptyState);
  const [showForm, setShowForm] = useState(false);
  const [editSeats, setEditSeats] = useState<Record<string, number>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Départ ajouté !");
      setShowForm(false);
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  const handleToggle = async (dep: Departure) => {
    setLoadingId(dep.id);
    await toggleDepartureActiveAction(dep.id, voyageId, !dep.active);
    setLoadingId(null);
  };

  const handleUpdateSeats = async (dep: Departure) => {
    const newSeats = editSeats[dep.id];
    if (!newSeats || newSeats < dep.seatsBooked) {
      toast.error(`Minimum ${dep.seatsBooked} places (déjà réservées)`);
      return;
    }
    setLoadingId(dep.id + "-seats");
    await updateDepartureSeatsAction(dep.id, voyageId, newSeats);
    setLoadingId(null);
    toast.success("Places mises à jour !");
  };

  const handleDelete = async (dep: Departure) => {
    if (!confirm("Supprimer ce départ ? (impossible s'il y a des réservations)")) return;
    setLoadingId(dep.id + "-del");
    try {
      await deleteDepartureAction(dep.id, voyageId);
      toast.success("Départ supprimé.");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setLoadingId(null);
  };

  const upcomingDepartures = departures
    .filter((d) => new Date(d.departDate) > new Date())
    .sort((a, b) => new Date(a.departDate).getTime() - new Date(b.departDate).getTime());

  const pastDepartures = departures
    .filter((d) => new Date(d.departDate) <= new Date())
    .sort((a, b) => new Date(b.departDate).getTime() - new Date(a.departDate).getTime());

  const renderDeparture = (dep: Departure) => {
    const isPast = new Date(dep.departDate) <= new Date();
    const fillPct = dep.seatsTotal > 0 ? Math.round((dep.seatsBooked / dep.seatsTotal) * 100) : 0;

    return (
      <div
        key={dep.id}
        className={`p-4 rounded-xl border transition-all ${
          !dep.active
            ? "border-white/5 bg-white/2 opacity-60"
            : isPast
            ? "border-white/5 bg-white/2"
            : "border-white/10 bg-white/4 hover:border-[#C9A84C]/20"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Dates */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-medium text-sm">
                {new Date(dep.departDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="text-white/30 text-xs">→</span>
              <span className="text-white/60 text-sm">
                {new Date(dep.returnDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              {!dep.active && <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Inactif</Badge>}
              {isPast && <Badge className="bg-white/5 text-white/30 border-white/10 text-xs">Passé</Badge>}
            </div>

            {/* Prix */}
            <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
              <span>Adulte : <strong className="text-[#C9A84C]">{dep.priceAdult.toLocaleString("fr-FR")} €</strong></span>
              {dep.priceChild && (
                <span>Enfant : <strong className="text-[#C9A84C]">{dep.priceChild.toLocaleString("fr-FR")} €</strong></span>
              )}
            </div>

            {/* Places */}
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-[200px]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40">{dep.seatsBooked} / {dep.seatsTotal} places</span>
                  <span className={fillPct >= 90 ? "text-red-400" : fillPct >= 70 ? "text-orange-400" : "text-green-400"}>
                    {fillPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fillPct >= 90 ? "bg-red-400" : fillPct >= 70 ? "bg-orange-400" : "bg-[#C9A84C]"
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

              {/* Modifier les places */}
              {!isPast && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={dep.seatsBooked}
                    defaultValue={dep.seatsTotal}
                    onChange={(e) => setEditSeats((prev) => ({ ...prev, [dep.id]: parseInt(e.target.value) }))}
                    className="w-20 h-7 bg-white/5 border-white/10 text-white text-xs text-center px-2"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateSeats(dep)}
                    disabled={loadingId === dep.id + "-seats"}
                    className="h-7 px-2 border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 text-xs"
                  >
                    {loadingId === dep.id + "-seats" ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isPast && (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggle(dep)}
                disabled={loadingId === dep.id}
                className={`h-8 w-8 p-0 border-white/10 ${dep.active ? "text-white/40 hover:text-orange-400" : "text-green-400 hover:text-green-300"}`}
                title={dep.active ? "Désactiver" : "Activer"}
              >
                {loadingId === dep.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : dep.active ? (
                  <ToggleRight className="w-3.5 h-3.5" />
                ) : (
                  <ToggleLeft className="w-3.5 h-3.5" />
                )}
              </Button>
              {dep.seatsBooked === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(dep)}
                  disabled={!!loadingId}
                  className="h-8 w-8 p-0 border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30"
                  title="Supprimer"
                >
                  {loadingId === dep.id + "-del" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Upcoming departures */}
      {upcomingDepartures.length === 0 && (
        <p className="text-white/30 text-sm text-center py-4">Aucun départ à venir. Ajoutez-en un !</p>
      )}
      <div className="space-y-3">
        {upcomingDepartures.map(renderDeparture)}
      </div>

      {/* Past departures (collapsible) */}
      {pastDepartures.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 text-white/30 text-xs cursor-pointer hover:text-white/50 select-none list-none py-2">
            <ChevronDown className="w-3 h-3 group-open:hidden" />
            <ChevronUp className="w-3 h-3 hidden group-open:block" />
            {pastDepartures.length} départ(s) passé(s)
          </summary>
          <div className="space-y-2 mt-2 opacity-60">
            {pastDepartures.map(renderDeparture)}
          </div>
        </details>
      )}

      {/* Add form toggle */}
      {!showForm ? (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full border-dashed border-[#C9A84C]/30 text-[#C9A84C]/60 hover:text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 gap-2"
        >
          <Plus className="w-4 h-4" /> Ajouter un départ
        </Button>
      ) : (
        <form action={formAction} className="border border-[#C9A84C]/20 rounded-xl p-5 space-y-4 bg-[#C9A84C]/3">
          <h4 className="text-white font-medium text-sm">Nouveau départ</h4>

          {state.error && !state.fieldErrors && (
            <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-white/60 text-xs">Date de départ *</Label>
              <Input
                name="departDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="bg-white/5 border-white/10 text-white h-9 text-sm focus:border-[#C9A84C]"
              />
              {state.fieldErrors?.departDate && <p className="text-red-400 text-xs">{state.fieldErrors.departDate[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-white/60 text-xs">Date de retour *</Label>
              <Input
                name="returnDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="bg-white/5 border-white/10 text-white h-9 text-sm focus:border-[#C9A84C]"
              />
              {state.fieldErrors?.returnDate && <p className="text-red-400 text-xs">{state.fieldErrors.returnDate[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-white/60 text-xs">Places *</Label>
              <Input
                name="seatsTotal"
                type="number"
                min={1}
                defaultValue={20}
                required
                className="bg-white/5 border-white/10 text-white h-9 text-sm focus:border-[#C9A84C]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/60 text-xs">Prix adulte (€) *</Label>
              <Input
                name="priceAdult"
                type="number"
                min={0}
                step="0.01"
                required
                className="bg-white/5 border-white/10 text-white h-9 text-sm focus:border-[#C9A84C]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/60 text-xs">Prix enfant (€)</Label>
              <Input
                name="priceChild"
                type="number"
                min={0}
                step="0.01"
                placeholder="Optionnel"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9 text-sm focus:border-[#C9A84C]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold h-9 text-sm"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter ce départ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="border-white/10 text-white/50 hover:text-white h-9 text-sm"
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
