import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const voyages = await prisma.voyage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true, country: true } },
      departures: { where: { active: true } },
      _count: { select: { reservations: true } },
    },
  });

  return NextResponse.json(
    voyages.map((voyage) => {
      const nextDeparture = voyage.departures
        .filter((d) => new Date(d.departDate) > new Date())
        .sort(
          (a, b) =>
            new Date(a.departDate).getTime() - new Date(b.departDate).getTime()
        )[0];

      const totalSeats = voyage.departures.reduce((s, d) => s + d.seatsTotal, 0);
      const bookedSeats = voyage.departures.reduce((s, d) => s + d.seatsBooked, 0);

      return {
        id: voyage.id,
        title: voyage.title,
        slug: voyage.slug,
        imageUrl: voyage.imageUrl,
        category: voyage.category,
        duration: voyage.duration,
        price: voyage.basePrice,
        active: voyage.active,
        featured: voyage.featured,
        destination: voyage.destination,
        reservationsCount: voyage._count.reservations,
        activeDepartures: voyage.departures.length,
        totalSeats,
        bookedSeats,
        fillRate: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
        nextDeparture: nextDeparture ? nextDeparture.departDate.toISOString() : null,
      };
    })
  );
}
