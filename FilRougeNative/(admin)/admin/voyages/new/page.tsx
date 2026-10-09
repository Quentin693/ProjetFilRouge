import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VoyageForm } from "@/components/admin/voyage-form";
import { createVoyageAction } from "@/actions/admin-voyage";

export const metadata: Metadata = { title: "Admin — Créer un voyage" };

export default async function NewVoyagePage() {
  const destinations = await prisma.destination.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, country: true },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/voyages"
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-white">Créer un voyage</h1>
          <p className="text-white/40 text-sm mt-1">Remplissez les informations du nouveau voyage</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <VoyageForm
          destinations={destinations}
          action={createVoyageAction}
          submitLabel="Créer le voyage"
        />
      </div>
    </div>
  );
}
