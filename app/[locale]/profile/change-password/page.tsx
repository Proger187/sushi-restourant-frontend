"use client";

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useChangePassword } from "@/lib/queries";

type PasswordForm = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export default function ChangePasswordPage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const change = useChangePassword();

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<PasswordForm>();

  const onSubmit = (data: PasswordForm) => {
    if (data.new_password !== data.confirm_password) {
      setError("confirm_password", { message: tAuth("password_mismatch") });
      return;
    }
    change.mutate(
      { current_password: data.current_password, new_password: data.new_password },
      {
        onSuccess: () => { toast.success(t("password_updated")); reset(); },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          setError("current_password", { message: msg ?? "Error" });
        },
      }
    );
  };

  const field = "w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent";

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("current_password", { required: true })}
            type="password"
            placeholder={t("current_password")}
            className={field}
          />
          {errors.current_password && (
            <p className="text-red-400 text-sm mt-1">{errors.current_password.message}</p>
          )}
        </div>
        <input
          {...register("new_password", { required: true, minLength: 8 })}
          type="password"
          placeholder={t("new_password")}
          className={field}
        />
        <div>
          <input
            {...register("confirm_password", { required: true })}
            type="password"
            placeholder={t("confirm_new_password")}
            className={field}
          />
          {errors.confirm_password && (
            <p className="text-red-400 text-sm mt-1">{errors.confirm_password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={change.isPending}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
        >
          {change.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("change_password_btn")}
        </button>
      </form>
    </div>
  );
}
