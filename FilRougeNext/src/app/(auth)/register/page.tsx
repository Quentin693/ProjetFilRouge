import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default async function RegisterPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-white mb-2">{t("joinAdventure")}</h1>
        <p className="text-white/50">
          {t("registerSubtitle")}
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
