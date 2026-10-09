import { getTranslations } from "next-intl/server";

export async function StatsSection() {
  const t = await getTranslations("stats");

  const STATS = [
    { value: "10 000+", label: t("travelers") },
    { value: "85+", label: t("destinations") },
    { value: "14 ans", label: t("expertise") },
    { value: "4.9/5", label: t("rating") },
  ];

  return (
    <section className="py-16 bg-[#C9A84C]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-serif text-4xl md:text-5xl font-semibold text-black mb-2">
                {stat.value}
              </p>
              <p className="text-black/60 text-sm tracking-wider uppercase font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
