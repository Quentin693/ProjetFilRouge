"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DestinationActionState } from "@/actions/admin-destination";

interface DestinationData {
  name?: string;
  country?: string;
  continent?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  highlights?: string[];
  featured?: boolean;
  rating?: number;
}

const CATEGORIES = [
  { value: "BEACH", label: "🏖️ Plage" },
  { value: "MOUNTAIN", label: "⛰️ Montagne" },
  { value: "CITY", label: "🏙️ Ville" },
  { value: "SAFARI", label: "🦁 Safari" },
  { value: "CRUISE", label: "🛳️ Croisière" },
  { value: "ISLAND", label: "🏝️ Île" },
  { value: "CULTURAL", label: "🏛️ Culture" },
];

const CONTINENTS = ["Asie", "Europe", "Afrique", "Amériques", "Moyen-Orient", "Océanie"];

const emptyState: DestinationActionState = {};

export function DestinationForm({
  action,
  destination,
  submitLabel = "Créer la destination",
}: {
  action: (prev: DestinationActionState, formData: FormData) => Promise<DestinationActionState>;
  destination?: DestinationData;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, emptyState);

  useEffect(() => {
    if (state.success) toast.success("Destination mise à jour !");
    if (state.error) toast.error(state.error);
  }, [state]);

  const field = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      {state.error && !state.fieldErrors && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Nom *</Label>
          <Input name="name" defaultValue={destination?.name} placeholder="Maldives" required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-11" />
          {field("name") && <p className="text-red-400 text-xs">{field("name")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Pays *</Label>
          <Input name="country" defaultValue={destination?.country} placeholder="Maldives" required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-11" />
          {field("country") && <p className="text-red-400 text-xs">{field("country")}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Continent *</Label>
          <select name="continent" defaultValue={destination?.continent ?? ""}
            className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-md px-3 text-sm focus:border-[#C9A84C] focus:outline-none" required>
            <option value="" className="bg-[#1A1A1A]">Choisir…</option>
            {CONTINENTS.map((c) => <option key={c} value={c} className="bg-[#1A1A1A]">{c}</option>)}
          </select>
          {field("continent") && <p className="text-red-400 text-xs">{field("continent")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Catégorie *</Label>
          <select name="category" defaultValue={destination?.category ?? ""}
            className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-md px-3 text-sm focus:border-[#C9A84C] focus:outline-none" required>
            <option value="" className="bg-[#1A1A1A]">Choisir…</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-[#1A1A1A]">{c.label}</option>)}
          </select>
          {field("category") && <p className="text-red-400 text-xs">{field("category")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Note (0-5)</Label>
          <Input name="rating" type="number" min={0} max={5} step={0.1} defaultValue={destination?.rating ?? 4.5}
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A84C] h-11" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/70 text-sm">Description *</Label>
        <Textarea name="description" defaultValue={destination?.description} placeholder="Décrivez cette destination…"
          required rows={4} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] resize-none" />
        {field("description") && <p className="text-red-400 text-xs">{field("description")}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-white/70 text-sm">URL de l&apos;image principale *</Label>
        <Input name="imageUrl" type="url" defaultValue={destination?.imageUrl} placeholder="https://images.unsplash.com/…"
          required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-11" />
        {field("imageUrl") && <p className="text-red-400 text-xs">{field("imageUrl")}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-white/70 text-sm">Points forts <span className="text-white/30 text-xs">(1 par ligne)</span></Label>
        <Textarea name="highlights" defaultValue={destination?.highlights?.join("\n")}
          placeholder={"Plages de sable blanc\nEaux turquoise\nCoraux exceptionnels"}
          rows={4} className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C] resize-none text-sm" />
      </div>

      <div className="flex items-center gap-3 p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl">
        <input type="checkbox" id="featured" name="featured" value="true" defaultChecked={destination?.featured ?? false}
          className="w-4 h-4 accent-[#C9A84C]" />
        <Label htmlFor="featured" className="text-white/80 text-sm cursor-pointer">✦ Mettre en avant sur la page d&apos;accueil</Label>
      </div>

      <Button type="submit" disabled={isPending}
        className="w-full h-12 bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-wider">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
