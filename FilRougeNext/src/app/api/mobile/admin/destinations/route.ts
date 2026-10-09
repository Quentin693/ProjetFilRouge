import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { voyages: true } } },
  });

  return NextResponse.json(
    destinations.map((dest) => ({
      id: dest.id,
      name: dest.name,
      country: dest.country,
      continent: dest.continent,
      category: dest.category,
      imageUrl: dest.imageUrl,
      rating: dest.rating,
      featured: dest.featured,
      active: dest.active,
      voyagesCount: dest._count.voyages,
    }))
  );
}
