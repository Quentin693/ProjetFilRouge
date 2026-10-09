"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { VoyageActionState } from "@/actions/admin-voyage";

interface Destination {
  id: string;
  name: string;
  country: string;
}

interface VoyageData {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  destinationId?: string;
  category?: string;
  duration?: number;
  maxGuests?: number;
  basePrice?: number;
  imageUrl?: string;
  includes?: string[];
  excludes?: string[];
  featured?: boolean;
}

const CATEGORIES = [
  { value: "LUXURY", label: "🌟 Luxe" },
  { value: "PREMIUM", label: "💎 Premium" },
  { value: "ADVENTURE", label: "🧗 Aventure" },
  { value: "HONEYMOON", label: "💑 Lune de miel" },
  { value: "FAMILY", label: "👨‍👩‍👧 Famille" },
  { value: "SOLO", label: "🎒 Solo" },
];

const emptyState: VoyageActionState = { error: undefined, fieldErrors: undefined };

export function VoyageForm({
  destinations,
  action,
  voyage,
  submitLabel = "Créer le voyage",
}: {
  destinations: Destination[];
  action: (prev: VoyageActionState, formData: FormData) => Promise<VoyageActionState>;
  voyage?: VoyageData;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, emptyState);

  useEffect(() => {
    if (state.success) toast.success("Voyage mis à jour avec succès !");
    if (state.error) toast.error(state.error);
  }, [state]);

  const field = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && !state.fieldErrors && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {/* Titre & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Titre *</Label>
          <Input
            name="title"
            defaultValue={voyage?.title}
            placeholder="Escapade à Bali…"
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-11"
          />
          {field("title") && <p className="text-red-400 text-xs">{field("title")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Slug URL * <span className="text-white/30 text-xs">(ex: escapade-bali)</span></Label>
          <Input
            name="slug"
            defaultValue={voyage?.slug}
            placeholder="escapade-bali"
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-11 font-mono"
          />
          {field("slug") && <p className="text-red-400 text-xs">{field("slug")}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">Description *</Label>
        <Textarea
          name="description"
          defaultValue={voyage?.description}
          placeholder="Décrivez ce voyage en détail…"
          required
          rows={4}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] resize-none"
        />
        {field("description") && <p className="text-red-400 text-xs">{field("description")}</p>}
      </div>

      {/* Destination, Catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Destination *</Label>
          <select
            name="destinationId"
            defaultValue={voyage?.destinationId ?? ""}
            required
            className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-md px-3 text-sm focus:border-[#C9A84C] focus:outline-none"
          >
            <option value="" className="bg-[#1A1A1A]">Choisir une destination…</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#1A1A1A]">
                {d.name} — {d.country}
              </option>
            ))}
          </select>
          {field("destinationId") && <p className="text-red-400 text-xs">{field("destinationId")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Catégorie *</Label>
          <select
            name="category"
            defaultValue={voyage?.category ?? ""}
            required
            className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-md px-3 text-sm focus:border-[#C9A84C] focus:outline-none"
          >
            <option value="" className="bg-[#1A1A1A]">Choisir une catégorie…</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#1A1A1A]">
                {c.label}
              </option>
            ))}
          </select>
          {field("category") && <p className="text-red-400 text-xs">{field("category")}</p>}
        </div>
      </div>

      {/* Durée, Max guests, Prix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Durée (jours) *</Label>
          <Input
            name="duration"
            type="number"
            min={1}
            defaultValue={voyage?.duration ?? 7}
            required
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A84C] h-11"
          />
          {field("duration") && <p className="text-red-400 text-xs">{field("duration")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Max. voyageurs *</Label>
          <Input
            name="maxGuests"
            type="number"
            min={1}
            defaultValue={voyage?.maxGuests ?? 20}
            required
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A84C] h-11"
          />
          {field("maxGuests") && <p className="text-red-400 text-xs">{field("maxGuests")}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Prix de base (€/pers.) *</Label>
          <Input
            name="basePrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={voyage?.basePrice ?? 0}
            required
            className="bg-white/5 border-white/10 text-white focus:border-[#C9A84C] h-11"
          />
          {field("basePrice") && <p className="text-red-400 text-xs">{field("basePrice")}</p>}
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label className="text-white/70 text-sm">URL de l&apos;image principale *</Label>
        <Input
          name="imageUrl"
          type="url"
          defaultValue={voyage?.imageUrl}
          placeholder="https://images.unsplash.com/…"
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-11"
        />
        {field("imageUrl") && <p className="text-red-400 text-xs">{field("imageUrl")}</p>}
      </div>

      {/* Inclus / Non inclus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">
            Ce qui est inclus <span className="text-white/30 text-xs">(1 élément par ligne)</span>
          </Label>
          <Textarea
            name="includes"
            defaultValue={voyage?.includes?.join("\n")}
            placeholder={"Vol aller-retour\nHôtel 5 étoiles\nPetit-déjeuner inclus"}
            rows={5}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C] resize-none text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">
            Non inclus <span className="text-white/30 text-xs">(1 élément par ligne)</span>
          </Label>
          <Textarea
            name="excludes"
            defaultValue={voyage?.excludes?.join("\n")}
            placeholder={"Visa\nDépenses personnelles\nPourboires"}
            rows={5}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C] resize-none text-sm"
          />
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3 p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          value="true"
          defaultChecked={voyage?.featured ?? false}
          className="w-4 h-4 accent-[#C9A84C]"
        />
        <Label htmlFor="featured" className="text-white/80 text-sm cursor-pointer">
          ✦ Mettre en avant sur la page d&apos;accueil
        </Label>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-wider"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
