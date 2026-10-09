import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-white mb-2">{t("welcomeBack")}</h1>
        <p className="text-white/50">
          {t("loginSubtitle")}
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
