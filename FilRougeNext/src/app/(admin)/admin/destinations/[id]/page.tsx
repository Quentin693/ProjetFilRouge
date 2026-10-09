import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DestinationForm } from "@/components/admin/destination-form";
import { updateDestinationAction } from "@/actions/admin-destination";

export const metadata: Metadata = { title: "Admin — Modifier destination" };

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: { _count: { select: { voyages: true } } },
  });
  if (!destination) notFound();

  const updateAction = updateDestinationAction.bind(null, destination.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/destinations"
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-white">{destination.name}</h1>
            <p className="text-white/40 text-sm">{destination.country} — {destination._count.voyages} voyage(s) associé(s)</p>
          </div>
        </div>
        <Link href={`/destinations/${destination.id}`} target="_blank"
          className="flex items-center gap-1.5 text-[#C9A84C]/60 hover:text-[#C9A84C] text-xs transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Page publique
        </Link>
      </div>

      <div className="relative h-40 rounded-xl overflow-hidden">
        <Image src={destination.imageUrl} alt={destination.name} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <DestinationForm
          action={updateAction}
          destination={{ ...destination, category: destination.category as string }}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
