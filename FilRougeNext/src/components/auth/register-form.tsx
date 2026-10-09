"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Check } from "lucide-react";
import { useTranslations } from "next-intl";

const initialState = { error: undefined as string | undefined, fieldErrors: undefined as Record<string, string[]> | undefined };

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const t = useTranslations("auth");

  const requirements = [
    { label: t("requirements.length"), met: password.length >= 8 },
    { label: t("requirements.uppercase"), met: /[A-Z]/.test(password) },
    { label: t("requirements.number"), met: /[0-9]/.test(password) },
  ];

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white/70 text-sm">
          {t("fullName")}
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jean Dupont"
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-12"
        />
        {state?.fieldErrors?.name && (
          <p className="text-red-400 text-xs">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70 text-sm">
          {t("email")}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-12"
        />
        {state?.fieldErrors?.email && (
          <p className="text-red-400 text-xs">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70 text-sm">
          {t("password")}
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] h-12 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password requirements */}
        {password.length > 0 && (
          <div className="space-y-1 mt-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    req.met ? "bg-green-500/20" : "bg-white/5"
                  }`}
                >
                  {req.met && <Check className="w-2.5 h-2.5 text-green-500" />}
                </div>
                <span
                  className={`text-xs ${req.met ? "text-green-400" : "text-white/30"}`}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-widest uppercase text-sm mt-2"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("register")
        )}
      </Button>

      <p className="text-white/30 text-xs text-center">
        {t("terms")}{" "}
        <Link href="/cgv" className="text-[#C9A84C] hover:underline">
          {t("cgv")}
        </Link>{" "}
        {t("and")}{" "}
        <Link href="/confidentialite" className="text-[#C9A84C] hover:underline">
          {t("privacy")}
        </Link>
        .
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#0D0D0D] px-4 text-white/30 text-xs">
            {t("hasAccount")}
          </span>
        </div>
      </div>

      <Link href="/login">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
        >
          {t("signIn")}
        </Button>
      </Link>
    </form>
  );
}
