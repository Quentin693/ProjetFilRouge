"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

interface Trip {
  id: string;
  adults: number;
  children: number;
  voyage: {
    title: string;
    imageUrl: string;
    destination: { name: string; country: string };
  };
  departure: {
    departDate: Date;
    returnDate: Date;
  };
}

export function UpcomingTrips({ trips }: { trips: Trip[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-GB";

  if (trips.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <h2 className="font-serif text-xl text-white mb-6">{t("upcomingTrips")}</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-[#C9A84C]" />
          </div>
          <p className="text-white/50 mb-4">{t("noUpcoming")}</p>
          <Link href="/voyages">
            <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black text-sm">
              {t("exploreVoyages")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl text-white">{t("upcomingTrips")}</h2>
        <Link href="/reservations" className="text-[#C9A84C] text-sm hover:underline flex items-center gap-1">
          {t("viewAll")} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => {
          const nights = Math.round(
            (new Date(trip.departure.returnDate).getTime() -
              new Date(trip.departure.departDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const daysUntil = Math.round(
            (new Date(trip.departure.departDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={trip.id}
              className="flex gap-4 p-4 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-[#C9A84C]/20 transition-all group"
            >
              {/* Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={trip.voyage.imageUrl}
                  alt={trip.voyage.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="80px"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-white font-medium text-sm truncate">
                    {trip.voyage.title}
                  </h3>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 ml-2 shrink-0 text-xs">
                    {daysUntil === 0
                      ? t("today")
                      : daysUntil === 1
                      ? t("tomorrow")
                      : `${t("daysUntil")}${daysUntil}`}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-white/40 text-xs mb-2">
                  <MapPin className="w-3 h-3" />
                  {trip.voyage.destination.name}, {trip.voyage.destination.country}
                </div>

                <div className="flex items-center gap-4 text-white/40 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(trip.departure.departDate).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                    })}
                    {" — "}
                    {nights} {t("nights")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {trip.adults + trip.children}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
