import Link from "next/link";
import { Compass, Mail, Phone, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  const footerLinks = {
    destinations: [
      { label: "Maldives", href: "/destinations/maldives" },
      { label: "Santorin", href: "/destinations/santorini" },
      { label: "Bali", href: "/destinations/bali" },
      { label: "Dubaï", href: "/destinations/dubai" },
      { label: "Kyoto", href: "/destinations/kyoto" },
    ],
    services: [
      { label: t("ourVoyages"), href: "/voyages" },
    ],
  };

  return (
    <footer className="bg-[#0D0D0D] border-t border-[#C9A84C]/20">
      <div className="container mx-auto px-6">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#C9A84C]" />
              <span className="font-serif text-xl font-semibold text-white tracking-widest uppercase">
                Voyage <span className="text-[#C9A84C]">Luxe</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { href: "https://instagram.com", label: "IG" },
                { href: "https://facebook.com", label: "FB" },
                { href: "https://x.com", label: "X" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]/60 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors text-xs font-bold"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-5">
              {t("destinations")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.destinations.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-5">
              {t("ourVoyages")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-5">
              {t("contact")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-white/50 text-sm whitespace-pre-line">
                  {t("address")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <a href="tel:+33142000000" className="text-white/50 hover:text-white text-sm transition-colors">
                  +33 1 42 00 00 00
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <a href="mailto:contact@voyage-luxe.fr" className="text-white/50 hover:text-white text-sm transition-colors">
                  contact@voyage-luxe.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#C9A84C]/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Voyage Luxe. {t("rights")}
          </p>
          <div className="flex gap-6">
            <Link href="/cgv" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              {t("cgv")}
            </Link>
            <Link href="/confidentialite" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/presse" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              {t("press")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
