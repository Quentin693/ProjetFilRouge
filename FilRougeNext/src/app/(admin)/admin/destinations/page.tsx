import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, EyeOff, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleDestinationActiveAction } from "@/actions/admin-destination";

export const metadata: Metadata = { title: "Admin — Destinations" };

const categoryLabels: Record<string, string> = {
  BEACH: "🏖️ Plage",
  MOUNTAIN: "⛰️ Montagne",
  CITY: "🏙️ Ville",
  SAFARI: "🦁 Safari",
  CRUISE: "🛳️ Croisière",
  ISLAND: "🏝️ Île",
  CULTURAL: "🏛️ Culture",
};

export default async function AdminDestinationsPage() {
  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { voyages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white">Destinations</h1>
          <p className="text-white/40 text-sm mt-1">{destinations.length} destination(s)</p>
        </div>
        <Link href="/admin/destinations/new">
          <Button className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold gap-2">
            <Plus className="w-4 h-4" /> Ajouter une destination
          </Button>
        </Link>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Destination", "Catégorie", "Continent", "Note", "Voyages", "Statut", "Actions"].map((h) => (
                <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider py-3 px-4 font-medium first:pl-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {destinations.map((dest) => (
              <tr key={dest.id} className="hover:bg-white/2 transition-colors group">
                <td className="py-3 px-4 pl-5">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image src={dest.imageUrl} alt={dest.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{dest.name}</p>
                      <p className="text-white/40 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {dest.country}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-white/60 text-xs">{categoryLabels[dest.category] || dest.category}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-white/60 text-xs">{dest.continent}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1 text-[#C9A84C] text-xs">
                    <Star className="w-3 h-3" fill="#C9A84C" />
                    {dest.rating}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-white/60 text-xs">{dest._count.voyages} voyage(s)</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {dest.featured && (
                      <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20 text-xs">✦ Mis en avant</Badge>
                    )}
                    <Badge className={dest.active
                      ? "bg-green-500/10 text-green-400 border-green-500/20 text-xs"
                      : "bg-red-500/10 text-red-400 border-red-500/20 text-xs"
                    }>
                      {dest.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/destinations/${dest.id}`}>
                      <Button variant="outline" size="sm" className="h-7 px-3 border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs">
                        Modifier
                      </Button>
                    </Link>
                    <form action={async () => {
                      "use server";
                      await toggleDestinationActiveAction(dest.id, !dest.active);
                    }}>
                      <Button type="submit" variant="outline" size="sm"
                        className={`h-7 w-7 p-0 border-white/10 ${dest.active ? "text-white/30 hover:text-red-400" : "text-green-400 hover:text-green-300"}`}
                        title={dest.active ? "Désactiver" : "Activer"}
                      >
                        {dest.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
