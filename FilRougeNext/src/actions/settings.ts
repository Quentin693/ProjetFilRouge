"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const ProfileSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  bio: z.string().max(500, "Bio trop longue").optional(),
});

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  const raw = {
    name: formData.get("name") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phone: formData.get("phone") as string,
    nationality: formData.get("nationality") as string,
    bio: formData.get("bio") as string,
  };

  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, firstName, lastName, phone, nationality, bio } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      firstName,
      lastName,
      phone,
      nationality,
      bio,
    },
    update: { firstName, lastName, phone, nationality, bio },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = PasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return { error: "Impossible de modifier le mot de passe" };

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isValid) return { error: "Mot de passe actuel incorrect" };

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function updatePreferencesAction(preferences: { budget: string; themes: string[] }) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, preferences },
    update: { preferences },
  });

  revalidatePath("/settings");
  return { success: true };
}
