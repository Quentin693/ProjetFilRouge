"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function MarketingNav() {
  const { data: session } = useSession();
  const t = useTranslations("nav");

  const navLinks = [
    { href: "/destinations", label: t("destinations") },
    { href: "/voyages", label: t("voyages") },
    { href: "/#about", label: t("about") },
    { href: "/#contact", label: t("contact") },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#C9A84C]/20 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Compass className="w-6 h-6 text-[#C9A84C] group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-serif text-xl font-semibold text-white tracking-widest uppercase">
            Voyage <span className="text-[#C9A84C]">Luxe</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-[#C9A84C] text-sm tracking-wider uppercase font-medium transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {session ? (
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black tracking-wider uppercase text-xs"
              >
                {t("mySpace")}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 tracking-wider uppercase text-xs"
                >
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-wider uppercase text-xs">
                  {t("start")}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#0D0D0D]/98 backdrop-blur-md border-t border-[#C9A84C]/20 px-6 py-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-white/80 hover:text-[#C9A84C] text-sm tracking-wider uppercase font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#C9A84C]/20 pt-4 flex flex-col gap-3">
              {session ? (
                <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}>
                  <Button className="w-full bg-[#C9A84C] hover:bg-[#A07830] text-black">
                    Mon Espace
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-white/30 text-white">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileOpen(false)}>
                    <Button className="w-full bg-[#C9A84C] hover:bg-[#A07830] text-black">
                      Commencer
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
