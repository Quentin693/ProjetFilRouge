"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";

interface Reservation {
  id: string;
  reference: string;
  status: string;
  totalPrice: number;
  adults: number;
  children: number;
  createdAt: Date;
  voyage: { title: string; destination: { name: string } };
  departure: { departDate: Date };
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function RecentReservations({ reservations }: { reservations: Reservation[] }) {
  const t = useTranslations("dashboard");
  const tr = useTranslations("reservations");
  const locale = useLocale();

  if (reservations.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <h2 className="font-serif text-xl text-white mb-4">{t("recentReservations")}</h2>
        <p className="text-white/40 text-sm py-6 text-center">
          {t("noReservations")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl text-white">{t("recentReservations")}</h2>
        <Link href="/reservations" className="text-[#C9A84C] text-sm hover:underline flex items-center gap-1">
          {t("viewAll")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 font-medium">
                {t("table.reference")}
              </th>
              <th className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 font-medium">
                {t("table.voyage")}
              </th>
              <th className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 font-medium hidden md:table-cell">
                {t("table.departure")}
              </th>
              <th className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 font-medium hidden md:table-cell">
                {t("table.travelers")}
              </th>
              <th className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 font-medium">
                {t("table.amount")}
              </th>
              <th className="text-left text-white/30 text-xs uppercase tracking-wider pb-3 font-medium">
                {t("table.status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reservations.map((res) => {
              const statusClass = statusStyles[res.status] || statusStyles.PENDING;
              const statusLabel = tr(`status.${res.status}` as keyof typeof tr);
              return (
                <tr key={res.id} className="group hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="text-[#C9A84C] text-sm font-mono">
                      #{res.reference.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-white text-sm">{res.voyage.title}</p>
                    <p className="text-white/40 text-xs">{res.voyage.destination.name}</p>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="text-white/60 text-sm">
                      {new Date(res.departure.departDate).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className="text-white/60 text-sm">
                      {res.adults + res.children} {t("table.persons")}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-white font-medium text-sm">
                      {res.totalPrice.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")} €
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge className={`${statusClass} text-xs`}>{statusLabel}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
