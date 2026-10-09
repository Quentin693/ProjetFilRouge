import { Search, Calendar, CreditCard, Plane } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function HowItWorks() {
  const t = await getTranslations("howItWorks");

  const STEPS = [
    {
      icon: Search,
      step: "01",
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      icon: Calendar,
      step: "02",
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      icon: CreditCard,
      step: "03",
      title: t("step3Title"),
      description: t("step3Desc"),
    },
    {
      icon: Plane,
      step: "04",
      title: t("step4Title"),
      description: t("step4Desc"),
    },
  ];

  return (
    <section className="py-24 bg-[#111111]" id="about">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            {t("label")}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white mt-3 mb-4">
            {t("title")}
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            {t("desc")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative group">
                {/* Connector Line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-[#C9A84C]/40 to-transparent z-0" />
                )}

                <div className="relative z-10">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] border border-[#C9A84C]/20 group-hover:border-[#C9A84C]/60 flex items-center justify-center transition-all duration-300">
                      <Icon className="w-8 h-8 text-[#C9A84C]" />
                    </div>
                    <span className="absolute -top-3 -right-3 font-serif text-4xl font-bold text-[#C9A84C]/10 group-hover:text-[#C9A84C]/20 transition-colors">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
