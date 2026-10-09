"use client";

import { useTransition } from "react";
import { updatePasswordAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

export function SecuritySettings() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.success) {
        toast.success("Mot de passe mis à jour !");
        formRef.current?.reset();
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="font-serif text-xl text-white mb-1">Sécurité du compte</h3>
        <p className="text-white/40 text-sm">Modifiez votre mot de passe</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Mot de passe actuel</Label>
          <Input
            name="currentPassword"
            type="password"
            required
            placeholder="••••••••"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Nouveau mot de passe</Label>
          <Input
            name="newPassword"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Confirmer le nouveau mot de passe</Label>
          <Input
            name="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Mettre à jour le mot de passe
          </>
        )}
      </Button>
    </form>
  );
}
