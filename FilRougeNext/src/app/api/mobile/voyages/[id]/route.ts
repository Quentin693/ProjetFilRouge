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

  const voyage = await prisma.voyage.findUnique({
    where: { id },
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
  });

  if (!voyage) {
    return NextResponse.json({ error: "Voyage introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    id: voyage.id,
    title: voyage.title,
    description: voyage.description,
    imageUrl: voyage.imageUrl,
    price: voyage.basePrice,
    duration: voyage.duration,
    category: voyage.category,
    destination: voyage.destination,
    departures: voyage.departures.map((d) => ({
      id: d.id,
      departureDate: d.departDate.toISOString(),
      returnDate: d.returnDate.toISOString(),
      availableSeats: d.seatsTotal - d.seatsBooked,
      isActive: d.active,
    })),
  });
}
