// Helper pour l'authentification des routes API mobile (JWT Bearer Token)
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-secret-change-in-prod"
);

export interface MobileUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  image: string | null;
}

export async function signMobileToken(user: MobileUser): Promise<string> {
  return new jose.SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyMobileToken(
  req: NextRequest
): Promise<MobileUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userId = payload.sub as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, image: true },
    });

    if (!user || !user.email) return null;
    return user as MobileUser;
  } catch {
    return null;
  }
}

export async function verifyMobileAdmin(
  req: NextRequest
): Promise<MobileUser | null> {
  const user = await verifyMobileToken(req);
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
