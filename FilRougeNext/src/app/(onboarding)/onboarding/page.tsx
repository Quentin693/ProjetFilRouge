import { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bienvenue",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.onboarded) redirect("/dashboard");

  return (
    <div className="w-full max-w-2xl">
      <OnboardingWizard user={session.user} />
    </div>
  );
}
