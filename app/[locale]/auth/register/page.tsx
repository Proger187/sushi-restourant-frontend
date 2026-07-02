"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { useCustomerRegister } from "@/lib/queries";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const register = useCustomerRegister();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("password_mismatch"));
      return;
    }

    register.mutate(
      { phone, name, password },
      {
        onSuccess: (data) => {
          login(data.access, data.refresh, data.user);
          router.push(redirect);
        },
        onError: () => setError(t("register_error")),
      }
    );
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t("register_title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t("name_placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <input
            type="tel"
            placeholder={t("phone_placeholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder={t("confirm_password_placeholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={register.isPending || !phone || !name || !password}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {register.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("register_button")}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          {t("have_account")}{" "}
          <Link href={`/auth/login?redirect=${redirect}`} className="text-accent hover:underline">
            {t("login_button")}
          </Link>
        </p>
      </div>
    </main>
  );
}
