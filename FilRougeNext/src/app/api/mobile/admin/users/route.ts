import { NextRequest, NextResponse } from "next/server";
import { verifyMobileAdmin } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = await verifyMobileAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reservations: true } },
      reservations: {
        select: { totalPrice: true, status: true },
      },
    },
  });

  return NextResponse.json(
    users.map((user) => {
      const totalSpent = user.reservations
        .filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED")
        .reduce((s, r) => s + r.totalPrice, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        reservationsCount: user._count.reservations,
        totalSpent,
      };
    })
  );
}
