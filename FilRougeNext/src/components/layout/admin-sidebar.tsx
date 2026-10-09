"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard, MapPin, Calendar, Users, BarChart3, LogOut, Plane } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/admin/voyages", icon: Plane, label: "Voyages" },
  { href: "/admin/destinations", icon: MapPin, label: "Destinations" },
  { href: "/admin/reservations", icon: Calendar, label: "Réservations" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/stats", icon: BarChart3, label: "Statistiques" },
];

export function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();

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
          <div>
            <span className="font-serif text-base font-semibold text-white tracking-widest uppercase">
              Voyage <span className="text-[#C9A84C]">Luxe</span>
            </span>
            <p className="text-[10px] text-white/30 tracking-widest uppercase">Administration</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
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
      </nav>

      {/* Back to app */}
      <div className="px-4 pb-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 text-sm transition-all"
        >
          ← Espace voyageur
        </Link>
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-red-500/10 text-red-400 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-red-400 text-xs">Administrateur</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
