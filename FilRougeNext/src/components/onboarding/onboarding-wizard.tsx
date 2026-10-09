"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "@/actions/onboarding";
import { toast } from "sonner";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

const TRAVEL_THEMES = [
  { id: "beach", label: "🏖️ Plage & Soleil" },
  { id: "culture", label: "🏛️ Culture & Histoire" },
  { id: "adventure", label: "🧗 Aventure" },
  { id: "gastronomy", label: "🍽️ Gastronomie" },
  { id: "wellness", label: "🧘 Bien-être & Spa" },
  { id: "safari", label: "🦁 Safari" },
  { id: "mountain", label: "⛰️ Montagne" },
  { id: "cruise", label: "🛳️ Croisière" },
];

const BUDGET_OPTIONS = [
  { id: "standard", label: "Standard", desc: "1 000 – 3 000 €", emoji: "✈️" },
  { id: "premium", label: "Premium", desc: "3 000 – 7 000 €", emoji: "🌟" },
  { id: "luxury", label: "Ultra Luxe", desc: "7 000 € +", emoji: "👑" },
];

const STEPS = [
  { id: 1, label: "Profil" },
  { id: 2, label: "Vos envies" },
  { id: 3, label: "Budget" },
];

export function OnboardingWizard({ user }: { user: User }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    nationality: "",
    themes: [] as string[],
    budget: "premium",
  });

  const toggleTheme = (id: string) => {
    setData((prev) => ({
      ...prev,
      themes: prev.themes.includes(id)
        ? prev.themes.filter((t) => t !== id)
        : [...prev.themes, id],
    }));
  };

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeOnboardingAction(data);
      if (result?.success) {
        toast.success("Bienvenue sur Voyage Luxe ! 🎉");
        router.push("/dashboard");
      } else {
        toast.error("Une erreur est survenue");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-serif text-4xl text-white mb-2">
          Bienvenue,{" "}
          <span className="text-[#C9A84C]">
            {user.name?.split(" ")[0] || "Voyageur"}
          </span>{" "}
          ✦
        </h1>
        <p className="text-white/50">
          Quelques questions pour personnaliser votre expérience
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all",
                step === s.id
                  ? "bg-[#C9A84C] text-black font-semibold"
                  : step > s.id
                  ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                  : "bg-white/5 text-white/30"
              )}
            >
              {step > s.id ? <Check className="w-3 h-3" /> : <span>{s.id}</span>}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-8",
                  step > s.id ? "bg-[#C9A84C]/40" : "bg-white/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
        {/* Step 1 - Profile */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-white">Votre profil</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-sm">Prénom</Label>
                <Input
                  value={data.firstName}
                  onChange={(e) => setData({ ...data, firstName: e.target.value })}
                  placeholder="Jean"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-sm">Nom</Label>
                <Input
                  value={data.lastName}
                  onChange={(e) => setData({ ...data, lastName: e.target.value })}
                  placeholder="Dupont"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-sm">Téléphone</Label>
              <Input
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+33 6 00 00 00 00"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-sm">Nationalité</Label>
              <Input
                value={data.nationality}
                onChange={(e) => setData({ ...data, nationality: e.target.value })}
                placeholder="Française"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
              />
            </div>
          </div>
        )}

        {/* Step 2 - Themes */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-white">
              Quel type de voyages vous fait rêver ?
            </h2>
            <p className="text-white/40 text-sm">Sélectionnez tout ce qui vous correspond</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TRAVEL_THEMES.map((theme) => {
                const selected = data.themes.includes(theme.id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => toggleTheme(theme.id)}
                    className={cn(
                      "p-4 rounded-xl border text-center text-sm transition-all",
                      selected
                        ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]"
                        : "border-white/10 text-white/50 hover:border-white/20"
                    )}
                  >
                    {selected && <Check className="w-3 h-3 mx-auto mb-1 text-[#C9A84C]" />}
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 - Budget */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif text-2xl text-white">
              Votre budget habituel par voyage
            </h2>
            <div className="space-y-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setData({ ...data, budget: opt.id })}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    data.budget === opt.id
                      ? "border-[#C9A84C] bg-[#C9A84C]/10"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{opt.label}</p>
                    <p className="text-white/40 text-sm">{opt.desc}</p>
                  </div>
                  {data.budget === opt.id && (
                    <div className="w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
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
            onClick={() => setStep((s) => s + 1)}
            className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold"
          >
            Continuer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isPending}
            className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Commencer l&apos;aventure 🚀
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
