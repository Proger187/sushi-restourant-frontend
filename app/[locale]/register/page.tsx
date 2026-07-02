"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { useCustomerRegister } from "@/lib/queries";
import Logo from "@/components/layout/Logo";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const register = useCustomerRegister();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/profile";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError(t("password_mismatch")); return; }
    register.mutate(
      { email, password, first_name: firstName, last_name: lastName, phone },
      {
        onSuccess: (data) => {
          login(data.access, data.refresh, data.customer);
          router.push(next);
        },
        onError: () => setError(t("register_error")),
      }
    );
  };

  const field = "w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent";

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-center">{t("register_title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder={t("first_name_placeholder")} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={field} />
            <input type="text" placeholder={t("last_name_placeholder")} value={lastName} onChange={(e) => setLastName(e.target.value)} className={field} />
          </div>
          <input type="email" placeholder={t("email_placeholder")} value={email} onChange={(e) => setEmail(e.target.value)} className={field} required />
          <input type="tel" placeholder={t("phone_placeholder")} value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
          <input type="password" placeholder={t("password_placeholder")} value={password} onChange={(e) => setPassword(e.target.value)} className={field} required />
          <input type="password" placeholder={t("confirm_password_placeholder")} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} required />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={register.isPending || !email || !password}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {register.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("register_button")}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          {t("have_account")}{" "}
          <Link href={`/login?next=${next}`} className="text-accent hover:underline">
            {t("login_button")}
          </Link>
        </p>
      </div>
    </main>
  );
}
