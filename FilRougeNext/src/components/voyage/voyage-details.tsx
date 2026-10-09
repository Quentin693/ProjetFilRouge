import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Voyage {
  description: string;
  includes: string[];
  excludes: string[];
  itinerary: unknown;
  destination: { highlights: string[] };
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export function VoyageDetails({ voyage }: { voyage: Voyage }) {
  const itinerary = (voyage.itinerary as ItineraryDay[]) || [];

  return (
    <div className="space-y-12">
      {/* Description */}
      <div>
        <h2 className="font-serif text-3xl text-white mb-4">À propos de ce voyage</h2>
        <p className="text-white/60 leading-relaxed text-lg">{voyage.description}</p>

        {/* Highlights */}
        {voyage.destination.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {voyage.destination.highlights.map((h, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] text-sm"
              >
                ✦ {h}
              </span>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* Includes / Excludes */}
      <div>
        <h2 className="font-serif text-3xl text-white mb-6">Ce qui est inclus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inclus */}
          <div className="space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Inclus</p>
            {voyage.includes.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Exclus */}
          {voyage.excludes.length > 0 && (
            <div className="space-y-3">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Non inclus</p>
              {voyage.excludes.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5 shrink-0">
                    <X className="w-3 h-3 text-red-400" />
                  </div>
                  <span className="text-white/50 text-sm">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary */}
      {itinerary.length > 0 && (
        <>
          <Separator className="bg-white/5" />
          <div>
            <h2 className="font-serif text-3xl text-white mb-8">Programme jour par jour</h2>
            <div className="space-y-0">
              {itinerary.map((day, i) => (
                <div key={i} className="flex gap-6 group">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center shrink-0 group-hover:bg-[#C9A84C]/20 transition-colors">
                      <span className="font-serif text-[#C9A84C] text-sm font-semibold">
                        {day.day}
                      </span>
                    </div>
                    {i < itinerary.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-[#C9A84C]/20 to-transparent my-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-8 pt-1">
                    <div className="text-[#C9A84C] text-xs uppercase tracking-widest mb-1 font-medium">
                      Jour {day.day}
                    </div>
                    <h3 className="font-serif text-lg text-white mb-2">{day.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
