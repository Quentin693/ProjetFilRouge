"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface OnboardingData {
  firstName: string;
  lastName: string;
  phone: string;
  nationality: string;
  themes: string[];
  budget: string;
}

export async function completeOnboardingAction(data: OnboardingData) {
  const session = await auth();
  if (!session) return { error: "Non authentifié" };

  const { firstName, lastName, phone, nationality, themes, budget } = data;

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      firstName,
      lastName,
      phone,
      nationality,
      preferences: { themes, budget },
    },
    update: {
      firstName,
      lastName,
      phone,
      nationality,
      preferences: { themes, budget },
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  });

  return { success: true };
}
