"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./profile-settings";
import { SecuritySettings } from "./security-settings";
import { PreferencesSettings } from "./preferences-settings";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  nationality: string | null;
  bio: string | null;
  preferences: unknown;
}

type ProfileProp = Profile | null;

export function SettingsTabs({ user, profile }: { user: User; profile: ProfileProp }) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-[#111111] border border-white/5 rounded-xl p-1 gap-1">
        <TabsTrigger
          value="profile"
          className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg"
        >
          Profil
        </TabsTrigger>
        <TabsTrigger
          value="preferences"
          className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg"
        >
          Préférences
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="data-active:bg-[#C9A84C] data-active:text-black text-white/50 hover:text-white px-4 py-2 rounded-lg"
        >
          Sécurité
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="preferences">
        <PreferencesSettings profile={profile} />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  );
}
