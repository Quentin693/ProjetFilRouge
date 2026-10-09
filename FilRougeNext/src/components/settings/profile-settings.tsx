"use client";

import { useTransition } from "react";
import { updateProfileAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Profile {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  nationality: string | null;
  bio: string | null;
}

type ProfileProp = Profile | null;

export function ProfileSettings({ user, profile }: { user: User; profile: ProfileProp }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result?.success) {
        toast.success("Profil mis à jour avec succès !");
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-6">
      <h3 className="font-serif text-xl text-white">Informations personnelles</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Prénom</Label>
          <Input
            name="firstName"
            defaultValue={profile?.firstName || ""}
            placeholder="Jean"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Nom</Label>
          <Input
            name="lastName"
            defaultValue={profile?.lastName || ""}
            placeholder="Dupont"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/60 text-sm">Nom d&apos;affichage</Label>
        <Input
          name="name"
          defaultValue={user.name || ""}
          placeholder="Jean Dupont"
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/60 text-sm">Email</Label>
        <Input
          value={user.email || ""}
          disabled
          className="bg-white/3 border-white/5 text-white/40 cursor-not-allowed"
        />
        <p className="text-white/30 text-xs">L&apos;email ne peut pas être modifié</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Téléphone</Label>
          <Input
            name="phone"
            defaultValue={profile?.phone || ""}
            placeholder="+33 6 00 00 00 00"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/60 text-sm">Nationalité</Label>
          <Input
            name="nationality"
            defaultValue={profile?.nationality || ""}
            placeholder="Française"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-white/60 text-sm">Bio</Label>
        <Textarea
          name="bio"
          defaultValue={profile?.bio || ""}
          placeholder="Parlez-nous de vos passions de voyage..."
          rows={4}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#C9A84C] resize-none"
        />
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
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </>
        )}
      </Button>
    </form>
  );
}
