"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { useCustomerLogin } from "@/lib/queries";
import Logo from "@/components/layout/Logo";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const loginMutation = useCustomerLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/profile";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          login(data.access, data.refresh, data.customer);
          router.push(next);
        },
        onError: () => setError(t("login_error")),
      }
    );
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-center">{t("login_title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent"
            required
          />
          <input
            type="password"
            placeholder={t("password_placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent"
            required
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loginMutation.isPending || !email || !password}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login_button")}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          {t("no_account")}{" "}
          <Link href={`/register?next=${next}`} className="text-accent hover:underline">
            {t("register_button")}
          </Link>
        </p>
      </div>
    </main>
  );
}
