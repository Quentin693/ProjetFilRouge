"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard, MapPin, Calendar, Settings, LogOut, ShieldAlert } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function AppSidebar({ user, isAdmin = false }: { user: User; isAdmin?: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/voyages", icon: MapPin, label: t("explore") },
    { href: "/reservations", icon: Calendar, label: t("reservations") },
    { href: "/settings", icon: Settings, label: t("settings") },
  ];

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#111111] border-r border-white/5">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#C9A84C]" />
          <span className="font-serif text-base font-semibold text-white tracking-widest uppercase">
            Voyage <span className="text-[#C9A84C]">Luxe</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/voyages" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Language Switcher */}
        <div className="pt-2">
          <LanguageSwitcher variant="sidebar" />
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <div className="pt-3 mt-2 border-t border-white/5">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-red-500/5 border border-red-500/15 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
            >
              <ShieldAlert className="w-4 h-4" />
              Administration
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-[#C9A84C]/10 text-[#C9A84C] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/40 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
