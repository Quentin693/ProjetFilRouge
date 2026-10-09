"use client";

import { useTransition } from "react";
import { setLocaleAction } from "@/actions/locale";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCALES = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher({ variant = "nav" }: { variant?: "nav" | "sidebar" }) {
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const handleChange = (value: string | null) => {
    if (!value) return;
    startTransition(async () => {
      await setLocaleAction(value as "fr" | "en");
      window.location.reload();
    });
  };

  if (variant === "sidebar") {
    return (
      <Select value={currentLocale} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-full bg-transparent border-white/10 text-white/50 hover:text-white hover:bg-white/5 focus:ring-0 focus:ring-offset-0 text-sm h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1A1A1A] border-white/10">
          {LOCALES.map((loc) => (
            <SelectItem
              key={loc.value}
              value={loc.value}
              className="text-white/70 hover:text-white focus:bg-white/10 focus:text-white cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{loc.flag}</span>
                <span>{loc.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={currentLocale} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-auto gap-2 border-[#C9A84C]/30 bg-transparent text-[#C9A84C]/80 hover:border-[#C9A84C] hover:text-[#C9A84C] focus:ring-0 focus:ring-offset-0 text-xs font-semibold tracking-wider uppercase h-8 px-3 rounded-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#1A1A1A] border-[#C9A84C]/20 min-w-[130px]">
        {LOCALES.map((loc) => (
          <SelectItem
            key={loc.value}
            value={loc.value}
            className="text-white/70 hover:text-white focus:bg-[#C9A84C]/10 focus:text-[#C9A84C] cursor-pointer text-sm"
          >
            <span className="flex items-center gap-2">
              <span>{loc.flag}</span>
              <span>{loc.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
