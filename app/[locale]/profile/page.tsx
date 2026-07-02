"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useProfile, useUpdateProfile } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

type ProfileForm = {
  first_name: string;
  last_name: string;
  phone: string;
};

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { first_name: "", last_name: "", phone: "" },
  });

  useEffect(() => {
    if (profile) {
      reset({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone });
    }
  }, [profile, reset]);

  const onSubmit = (data: ProfileForm) => {
    update.mutate(data, {
      onSuccess: () => toast.success(t("saved")),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  const field = "w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent";

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
      <div>
        <p className="text-sm text-muted">
          {t("member_since")} {profile?.date_joined ? formatDate(profile.date_joined) : "—"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">{t("email")}</label>
          <input
            value={profile?.email ?? ""}
            disabled
            className={`${field} opacity-50 cursor-not-allowed`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">{t("first_name")}</label>
            <input {...register("first_name")} className={field} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">{t("last_name")}</label>
            <input {...register("last_name")} className={field} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">{t("phone")}</label>
          <input {...register("phone")} type="tel" className={field} />
        </div>
        <button
          type="submit"
          disabled={update.isPending}
          className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
        >
          {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("save")}
        </button>
      </form>
    </div>
  );
}
