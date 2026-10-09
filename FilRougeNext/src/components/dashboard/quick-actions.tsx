"use client";

import Link from "next/link";
import { Search, Calendar, Settings, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

export function QuickActions() {
  const t = useTranslations("dashboard");

  const actions = [
    {
      href: "/voyages",
      icon: Search,
      label: t("actions.explore"),
      description: t("actions.exploreDesc"),
      color: "text-[#C9A84C]",
      bg: "bg-[#C9A84C]/10",
      border: "hover:border-[#C9A84C]/30",
    },
    {
      href: "/reservations",
      icon: Calendar,
      label: t("actions.reservations"),
      description: t("actions.reservationsDesc"),
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "hover:border-blue-400/30",
    },
    {
      href: "/settings",
      icon: Settings,
      label: t("actions.settings"),
      description: t("actions.settingsDesc"),
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "hover:border-purple-400/30",
    },
    {
      href: "/#contact",
      icon: Headphones,
      label: t("actions.support"),
      description: t("actions.supportDesc"),
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "hover:border-green-400/30",
    },
  ];

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
      <h2 className="font-serif text-xl text-white mb-6">{t("quickActions")}</h2>
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 ${action.border} hover:bg-white/5 transition-all group`}
            >
              <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{action.label}</p>
                <p className="text-white/40 text-xs">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
