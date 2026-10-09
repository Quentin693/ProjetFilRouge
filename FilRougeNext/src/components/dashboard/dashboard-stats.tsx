"use client";

import { Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Stats {
  totalReservations: number;
  confirmedReservations: number;
  upcomingCount: number;
  totalSpent: number;
}

export function DashboardStats({ stats }: { stats: Stats }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const cards = [
    {
      title: t("totalReservations"),
      value: stats.totalReservations.toString(),
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: t("confirmed"),
      value: stats.confirmedReservations.toString(),
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      title: t("upcoming"),
      value: stats.upcomingCount.toString(),
      icon: Clock,
      color: "text-[#C9A84C]",
      bg: "bg-[#C9A84C]/10",
    },
    {
      title: t("totalSpent"),
      value: `${stats.totalSpent.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")} €`,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-[#111111] border border-white/5 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/50 text-sm">{card.title}</p>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="font-serif text-2xl text-white font-medium">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
