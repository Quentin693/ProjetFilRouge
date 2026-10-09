"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Guard admin
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

// ──────────────────────────────────────────────────────
// CREATE VOYAGE
// ──────────────────────────────────────────────────────
const VoyageSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug : lettres minuscules, chiffres et tirets uniquement"),
  description: z.string().min(10),
  destinationId: z.string().min(1),
  category: z.enum(["LUXURY", "PREMIUM", "ADVENTURE", "HONEYMOON", "FAMILY", "SOLO"]),
  duration: z.coerce.number().min(1),
  maxGuests: z.coerce.number().min(1),
  basePrice: z.coerce.number().min(0),
  imageUrl: z.string().url("URL d'image invalide"),
  includes: z.string(),
  excludes: z.string(),
  featured: z.coerce.boolean().optional(),
});

export type VoyageActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createVoyageAction(
  _prev: VoyageActionState,
  formData: FormData
): Promise<VoyageActionState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = VoyageSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // Vérifier que le slug est unique
  const existing = await prisma.voyage.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "Ce slug est déjà utilisé pour un autre voyage." };

  const includes = data.includes.split("\n").map((s) => s.trim()).filter(Boolean);
  const excludes = data.excludes.split("\n").map((s) => s.trim()).filter(Boolean);

  await prisma.voyage.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      destinationId: data.destinationId,
      category: data.category,
      duration: data.duration,
      maxGuests: data.maxGuests,
      basePrice: data.basePrice,
      imageUrl: data.imageUrl,
      gallery: [],
      includes,
      excludes,
      itinerary: [],
      featured: data.featured ?? false,
      active: true,
    },
  });

  revalidatePath("/admin/voyages");
  redirect("/admin/voyages");
}

// ──────────────────────────────────────────────────────
// UPDATE VOYAGE
// ──────────────────────────────────────────────────────
export async function updateVoyageAction(
  voyageId: string,
  _prev: VoyageActionState,
  formData: FormData
): Promise<VoyageActionState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = VoyageSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // Vérifier unicité du slug (sauf pour ce voyage)
  const existing = await prisma.voyage.findFirst({
    where: { slug: data.slug, NOT: { id: voyageId } },
  });
  if (existing) return { error: "Ce slug est déjà utilisé." };

  const includes = data.includes.split("\n").map((s) => s.trim()).filter(Boolean);
  const excludes = data.excludes.split("\n").map((s) => s.trim()).filter(Boolean);

  await prisma.voyage.update({
    where: { id: voyageId },
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      destinationId: data.destinationId,
      category: data.category,
      duration: data.duration,
      maxGuests: data.maxGuests,
      basePrice: data.basePrice,
      imageUrl: data.imageUrl,
      includes,
      excludes,
      featured: data.featured ?? false,
    },
  });

  revalidatePath("/admin/voyages");
  revalidatePath(`/admin/voyages/${voyageId}`);
  return { success: true };
}

// ──────────────────────────────────────────────────────
// TOGGLE VOYAGE ACTIVE
// ──────────────────────────────────────────────────────
export async function toggleVoyageActiveAction(voyageId: string, active: boolean) {
  await requireAdmin();
  await prisma.voyage.update({ where: { id: voyageId }, data: { active } });
  revalidatePath("/admin/voyages");
  revalidatePath(`/admin/voyages/${voyageId}`);
}

// ──────────────────────────────────────────────────────
// DELETE VOYAGE
// ──────────────────────────────────────────────────────
export async function deleteVoyageAction(voyageId: string) {
  await requireAdmin();
  await prisma.voyage.delete({ where: { id: voyageId } });
  revalidatePath("/admin/voyages");
  redirect("/admin/voyages");
}

// ──────────────────────────────────────────────────────
// DEPARTURES
// ──────────────────────────────────────────────────────
const DepartureSchema = z.object({
  departDate: z.string().min(1, "Date de départ requise"),
  returnDate: z.string().min(1, "Date de retour requise"),
  seatsTotal: z.coerce.number().min(1),
  priceAdult: z.coerce.number().min(0),
  priceChild: z.coerce.number().optional(),
});

export type DepartureActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function addDepartureAction(
  voyageId: string,
  _prev: DepartureActionState,
  formData: FormData
): Promise<DepartureActionState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = DepartureSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const depart = new Date(data.departDate);
  const retour = new Date(data.returnDate);

  if (retour <= depart) {
    return { error: "La date de retour doit être après la date de départ." };
  }

  await prisma.departure.create({
    data: {
      voyageId,
      departDate: depart,
      returnDate: retour,
      seatsTotal: data.seatsTotal,
      priceAdult: data.priceAdult,
      priceChild: data.priceChild ?? null,
      active: true,
    },
  });

  revalidatePath(`/admin/voyages/${voyageId}`);
  return { success: true };
}

export async function updateDepartureSeatsAction(
  departureId: string,
  voyageId: string,
  seatsTotal: number
) {
  await requireAdmin();
  await prisma.departure.update({
    where: { id: departureId },
    data: { seatsTotal },
  });
  revalidatePath(`/admin/voyages/${voyageId}`);
}

export async function toggleDepartureActiveAction(
  departureId: string,
  voyageId: string,
  active: boolean
) {
  await requireAdmin();
  await prisma.departure.update({ where: { id: departureId }, data: { active } });
  revalidatePath(`/admin/voyages/${voyageId}`);
}

export async function deleteDepartureAction(departureId: string, voyageId: string) {
  await requireAdmin();
  // Vérifie qu'il n'y a pas de réservations
  const count = await prisma.reservation.count({ where: { departureId } });
  if (count > 0) {
    throw new Error("Impossible de supprimer un départ avec des réservations.");
  }
  await prisma.departure.delete({ where: { id: departureId } });
  revalidatePath(`/admin/voyages/${voyageId}`);
}

// ──────────────────────────────────────────────────────
// UPDATE RESERVATION STATUS (admin)
// ──────────────────────────────────────────────────────
export async function updateReservationStatusAction(
  reservationId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED"
) {
  await requireAdmin();
  await prisma.reservation.update({ where: { id: reservationId }, data: { status } });
  revalidatePath("/admin/voyages");
  revalidatePath("/admin");
}
