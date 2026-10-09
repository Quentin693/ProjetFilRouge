import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function CtaSection() {
  const t = await getTranslations("cta");

  return (
    <section className="relative py-32 overflow-hidden" id="contact">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=90&auto=format&fit=crop"
          alt="Dubai night"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/80 to-[#0D0D0D]/60" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-2xl">
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            {t("label")}
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-white mt-3 mb-6 leading-tight">
            {t("title1")}
            <br />
            {t("title2")}
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-lg">
            {t("desc")}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-widest uppercase px-8 h-14"
              >
                {t("btn1")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/voyages">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 tracking-widest uppercase px-8 h-14"
              >
                {t("btn2")}
              </Button>
            </Link>
          </div>

          <p className="text-white/30 text-xs mt-6">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
