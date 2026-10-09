"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

const initialState = { error: undefined as string | undefined, fieldErrors: undefined as Record<string, string[]> | undefined };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth");

  return (
    <form action={formAction} className="space-y-5">
      {/* Global Error */}
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

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
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 h-12"
        />
        {state?.fieldErrors?.email && (
          <p className="text-red-400 text-xs">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white/70 text-sm">
            {t("password")}
          </Label>
          <button type="button" className="text-[#C9A84C] text-xs hover:underline">
            {t("forgotPassword")}
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C9A84C] focus:ring-[#C9A84C]/20 h-12 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {state?.fieldErrors?.password && (
          <p className="text-red-400 text-xs">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-[#C9A84C] hover:bg-[#A07830] text-black font-semibold tracking-widest uppercase text-sm"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("login")
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#0D0D0D] px-4 text-white/30 text-xs">
            {t("noAccount")}
          </span>
        </div>
      </div>

      {/* Register Link */}
      <Link href="/register">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
        >
          {t("createAccount")}
        </Button>
      </Link>
    </form>
  );
}
