import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/destinations";
import { getTranslations } from "next-intl/server";

export async function Testimonials() {
  const t = await getTranslations("testimonials");

  return (
    <section className="py-24 bg-[#0D0D0D]">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            {t("label")}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-white mt-3 mb-4">
            {t("title")}
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#1A1A1A] border border-white/5 hover:border-[#C9A84C]/20 rounded-2xl p-6 transition-all duration-300 group relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#C9A84C]/10 group-hover:text-[#C9A84C]/20 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#C9A84C]" fill="#C9A84C" />
                ))}
              </div>

              {/* Content */}
              <h4 className="font-serif text-lg text-white mb-2">{testimonial.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed mb-6">{testimonial.content}</p>

              {/* Voyage */}
              <div className="text-xs text-[#C9A84C] tracking-wider uppercase mb-4">
                ✦ {testimonial.voyage}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{testimonial.name}</p>
                  <p className="text-white/40 text-xs">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
