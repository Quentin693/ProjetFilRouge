import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Accès administrateur requis." },
      { status: 403 }
    );
  }

  const { id } = await params;

  // Prevent self-modification
  if (id === admin.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas modifier votre propre rôle." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 }
    );
  }

  const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
  const updated = await prisma.user.update({
    where: { id },
    data: { role: newRole },
    select: { id: true, role: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { error: "Accès administrateur requis." },
      { status: 403 }
    );
  }

  const { id } = await params;

  // Prevent self-deletion
  if (id === admin.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 }
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
