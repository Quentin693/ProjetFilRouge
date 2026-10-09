import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/components/admin/user-actions";

export const metadata: Metadata = { title: "Admin — Utilisateurs" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reservations: true } },
      reservations: {
        select: { totalPrice: true, status: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Utilisateurs</h1>
        <p className="text-white/40 text-sm mt-1">{users.length} compte(s) inscrit(s)</p>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom ou email…"
          className="flex-1 h-10 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg px-4 text-sm focus:border-[#C9A84C] focus:outline-none"
        />
        <button type="submit" className="px-4 h-10 bg-[#C9A84C] hover:bg-[#A07830] text-black text-sm font-semibold rounded-lg transition-colors">
          Rechercher
        </button>
        {q && (
          <a href="/admin/users"
            className="px-4 h-10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-colors flex items-center">
            Effacer
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Utilisateur", "Rôle", "Inscrit le", "Réservations", "Total dépensé", "Actions"].map((h) => (
                <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider py-3 px-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => {
              const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
              const totalSpent = user.reservations
                .filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED")
                .reduce((s, r) => s + r.totalPrice, 0);

              return (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback className={`text-xs ${user.role === "ADMIN" ? "bg-red-500/10 text-red-400" : "bg-[#C9A84C]/10 text-[#C9A84C]"}`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white text-sm font-medium">{user.name ?? "—"}</p>
                        <p className="text-white/40 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={user.role === "ADMIN"
                      ? "bg-red-500/10 text-red-400 border-red-500/20 text-xs"
                      : "bg-white/5 text-white/50 border-white/10 text-xs"
                    }>
                      {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
                    </Badge>
                    {!user.onboarded && (
                      <Badge className="ml-1 bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">Non onboardé</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white/50 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white/70 text-sm">{user._count.reservations}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[#C9A84C] text-sm font-medium">
                      {totalSpent > 0 ? `${totalSpent.toLocaleString("fr-FR")} €` : "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <AdminUserActions userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
