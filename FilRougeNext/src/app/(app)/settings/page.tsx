import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl text-white">Paramètres</h1>
        <p className="text-white/40 text-sm mt-1">
          Gérez votre profil, vos préférences et la sécurité de votre compte
        </p>
      </div>

      <SettingsTabs user={user} profile={user.profile} />
    </div>
  );
}
