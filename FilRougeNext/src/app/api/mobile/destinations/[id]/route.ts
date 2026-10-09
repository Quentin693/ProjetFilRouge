import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const destination = await prisma.destination.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      country: true,
      description: true,
      imageUrl: true,
      highlights: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!destination) {
    return NextResponse.json({ error: "Destination introuvable." }, { status: 404 });
  }

  return NextResponse.json(destination);
}
