import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const destinations = await prisma.destination.findMany({
    where: { active: true },
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
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(destinations);
}
