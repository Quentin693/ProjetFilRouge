"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Star, Award, Shield } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1920&q=90&auto=format&fit=crop",
    location: { fr: "Maldives", en: "Maldives" },
    tagline: { fr: "L'Océan à l'état pur", en: "The Ocean in its purest form" },
  },
  {
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=90&auto=format&fit=crop",
    location: { fr: "Santorin, Grèce", en: "Santorini, Greece" },
    tagline: { fr: "La Méditerranée en bleu et blanc", en: "The Mediterranean in blue and white" },
  },
  {
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=90&auto=format&fit=crop",
    location: { fr: "Bali, Indonésie", en: "Bali, Indonesia" },
    tagline: { fr: "L'Île des Dieux", en: "The Island of the Gods" },
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = useTranslations("hero");
  const locale = useLocale() as "fr" | "en";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background Image */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1500 ${
            i === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={s.location[locale]}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full container mx-auto px-6">
        <div className="max-w-3xl">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#C9A84C]/40 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-[#C9A84C] text-xs font-medium tracking-widest uppercase">
              {slide.location[locale]}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 leading-tight">
            {t("title1")}
            <br />
            <span className="text-[#C9A84C] font-medium">{t("title2")}</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl mb-8 max-w-xl leading-relaxed font-light">
            {slide.tagline[locale]} {t("subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link href="/voyages">
              <Button
                size="lg"
                className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-widest uppercase px-8 h-14 text-sm"
              >
                {t("cta1")}
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:border-white tracking-widest uppercase px-8 h-14 text-sm backdrop-blur-sm"
              >
                {t("cta2")}
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60">
              <Star className="w-4 h-4 text-[#C9A84C]" fill="#C9A84C" />
              <span className="text-sm">{t("badge1")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Award className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-sm">{t("badge2")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Shield className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-sm">{t("badge3")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-8 bg-[#C9A84C]" : "w-4 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">{t("scroll")}</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
