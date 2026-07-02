"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/customer/token/", {
        username: phone,
        password,
      });
      localStorage.setItem("customer_token", data.access);
      localStorage.setItem("customer_refresh_token", data.refresh);
      const profile = await api.get("/api/auth/customer/profile/");
      login(data.access, data.refresh, profile.data);
      router.push(redirect);
    } catch {
      setError(t("login_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t("login_title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login_button")}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          {t("no_account")}{" "}
          <Link href={`/auth/register?redirect=${redirect}`} className="text-accent hover:underline">
            {t("register_button")}
          </Link>
        </p>
      </div>
    </main>
  );
}
