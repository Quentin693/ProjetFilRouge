"use client";

import { useState, useTransition } from "react";
import { updatePreferencesAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Profile {
  preferences: unknown;
}

type ProfileProp = Profile | null;

const TRAVEL_THEMES = [
  "Plage & Soleil", "Culture & Histoire", "Aventure", "Gastronomie",
  "Bien-être & Spa", "Safari", "Montagne", "Croisière",
  "Ville & Shopping", "Nature & Randonnée",
];

const BUDGET_OPTIONS = [
  { id: "standard", label: "Standard", desc: "1 000 – 3 000 €" },
  { id: "premium", label: "Premium", desc: "3 000 – 7 000 €" },
  { id: "luxury", label: "Luxe", desc: "7 000 € +" },
];

export function PreferencesSettings({ profile }: { profile: ProfileProp }) {
  const [isPending, startTransition] = useTransition();

  const prefs = (profile?.preferences as Record<string, unknown>) || {};
  const [budget, setBudget] = useState<string>((prefs.budget as string) || "premium");
  const [themes, setThemes] = useState<string[]>((prefs.themes as string[]) || []);

  const toggleTheme = (theme: string) => {
    setThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePreferencesAction({ budget, themes });
      if (result?.success) {
        toast.success("Préférences sauvegardées !");
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-8">
      <div>
        <h3 className="font-serif text-xl text-white mb-1">Préférences de voyage</h3>
        <p className="text-white/40 text-sm">Personnalisez vos recommandations</p>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <p className="text-white/60 text-sm font-medium">Budget par voyage</p>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBudget(opt.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                budget === opt.id
                  ? "border-[#C9A84C] bg-[#C9A84C]/10"
                  : "border-white/10 bg-white/2 hover:border-white/20"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm font-medium">{opt.label}</span>
                {budget === opt.id && (
                  <Check className="w-4 h-4 text-[#C9A84C]" />
                )}
              </div>
              <span className="text-white/40 text-xs">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Themes */}
      <div className="space-y-3">
        <p className="text-white/60 text-sm font-medium">
          Thèmes favoris{" "}
          <span className="text-white/30 text-xs font-normal">(plusieurs choix possibles)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_THEMES.map((theme) => {
            const selected = themes.includes(theme);
            return (
              <button
                key={theme}
                type="button"
                onClick={() => toggleTheme(theme)}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm transition-all",
                  selected
                    ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                )}
              >
                {selected && <Check className="w-3 h-3 inline mr-1" />}
                {theme}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les préférences
          </>
        )}
      </Button>
    </div>
  );
}
