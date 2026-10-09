import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DestinationForm } from "@/components/admin/destination-form";
import { createDestinationAction } from "@/actions/admin-destination";

export const metadata: Metadata = { title: "Admin — Nouvelle destination" };

export default function NewDestinationPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/destinations"
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-white">Nouvelle destination</h1>
          <p className="text-white/40 text-sm mt-1">Ajoutez une destination à votre catalogue</p>
        </div>
      </div>
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <DestinationForm action={createDestinationAction} submitLabel="Créer la destination" />
      </div>
    </div>
  );
}
