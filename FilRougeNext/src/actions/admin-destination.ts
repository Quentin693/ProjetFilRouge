"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}

const DestinationSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  continent: z.string().min(2),
  description: z.string().min(10),
  category: z.enum(["BEACH", "MOUNTAIN", "CITY", "SAFARI", "CRUISE", "ISLAND", "CULTURAL"]),
  imageUrl: z.string().url("URL invalide"),
  highlights: z.string(),
  featured: z.coerce.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
});

export type DestinationActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createDestinationAction(
  _prev: DestinationActionState,
  formData: FormData
): Promise<DestinationActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = DestinationSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  const highlights = data.highlights.split("\n").map((s) => s.trim()).filter(Boolean);

  await prisma.destination.create({
    data: {
      name: data.name,
      country: data.country,
      continent: data.continent,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      gallery: [],
      highlights,
      featured: data.featured ?? false,
      rating: data.rating ?? 4.5,
      active: true,
    },
  });

  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}

export async function updateDestinationAction(
  id: string,
  _prev: DestinationActionState,
  formData: FormData
): Promise<DestinationActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = DestinationSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const data = parsed.data;
  const highlights = data.highlights.split("\n").map((s) => s.trim()).filter(Boolean);

  await prisma.destination.update({
    where: { id },
    data: {
      name: data.name,
      country: data.country,
      continent: data.continent,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      highlights,
      featured: data.featured ?? false,
      rating: data.rating ?? 4.5,
    },
  });

  revalidatePath("/admin/destinations");
  return { success: true };
}

export async function toggleDestinationActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.destination.update({ where: { id }, data: { active } });
  revalidatePath("/admin/destinations");
}
