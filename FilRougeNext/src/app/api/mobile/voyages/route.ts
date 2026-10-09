import { NextRequest, NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { VoyageCategory } from "@prisma/client";

const VALID_CATEGORIES = new Set(Object.values(VoyageCategory));

export async function GET(req: NextRequest) {
  const user = await verifyMobileToken(req);
  if (!user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const categoryFilter =
    category && VALID_CATEGORIES.has(category as VoyageCategory)
      ? (category as VoyageCategory)
      : undefined;

  const voyages = await prisma.voyage.findMany({
    where: {
      active: true,
      ...(categoryFilter && { category: categoryFilter }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { destination: { name: { contains: search, mode: "insensitive" } } },
          { destination: { country: { contains: search, mode: "insensitive" } } },
        ],
      }),
    },
    include: {
      destination: {
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
      },
      departures: {
        where: { active: true },
        select: {
          id: true,
          departDate: true,
          returnDate: true,
          seatsTotal: true,
          seatsBooked: true,
          active: true,
        },
        orderBy: { departDate: "asc" },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const adapted = voyages.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    imageUrl: v.imageUrl,
    price: v.basePrice,
    duration: v.duration,
    category: v.category,
    destination: v.destination,
    departures: v.departures.map((d) => ({
      id: d.id,
      departureDate: d.departDate.toISOString(),
      returnDate: d.returnDate.toISOString(),
      availableSeats: d.seatsTotal - d.seatsBooked,
      isActive: d.active,
    })),
  }));

  return NextResponse.json(adapted);
}
