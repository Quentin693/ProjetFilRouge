"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function AppHeader({ user }: { user: User }) {
  const t = useTranslations("header");
  const locale = useLocale();

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("greeting.morning")
      : hour < 18
      ? t("greeting.afternoon")
      : t("greeting.evening");

  return (
    <header className="h-16 bg-[#111111] border-b border-white/5 flex items-center justify-between px-6">
      {/* Greeting */}
      <div>
        <p className="text-white font-medium">
          {greeting},{" "}
          <span className="text-[#C9A84C]">{user.name?.split(" ")[0]}</span> ✦
        </p>
        <p className="text-white/30 text-xs">
          {new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9 w-64 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm"
          />
        </div>

        <button className="relative w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-white/60" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A84C]" />
        </button>

        <Avatar className="w-9 h-9 cursor-pointer">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="bg-[#C9A84C]/10 text-[#C9A84C] text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
