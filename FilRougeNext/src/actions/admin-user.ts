"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function toggleUserRoleAction(userId: string, currentRole: string) {
  const session = await requireAdmin();
  // Ne pas modifier son propre compte
  if (session.user.id === userId) throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
  await prisma.user.update({ where: { id: userId }, data: { role: newRole as "USER" | "ADMIN" } });
  revalidatePath("/admin/users");
}

export async function deleteUserAction(userId: string) {
  const session = await requireAdmin();
  if (session.user.id === userId) throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
