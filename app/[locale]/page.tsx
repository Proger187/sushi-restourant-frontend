"use client";

import Link from "next/link";
import { UtensilsCrossed, CreditCard, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProducts } from "@/lib/queries";
import ProductCard from "@/components/menu/ProductCard";
import ProductCardSkeleton from "@/components/menu/ProductCardSkeleton";

export default function Home() {
  const t = useTranslations("home");
  const { data: featured, isLoading } = useProducts(undefined, true);

  const steps = [
    { icon: UtensilsCrossed, title: t("step1_title"), desc: t("step1_desc") },
    { icon: CreditCard, title: t("step2_title"), desc: t("step2_desc") },
    { icon: Truck, title: t("step3_title"), desc: t("step3_desc") },
  ];

  return (
    <main>
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-background via-surface to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        <div className="relative text-center px-4 max-w-3xl mx-auto space-y-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl font-bold leading-tight">
            {t("hero_title").split(" ").slice(0, 2).join(" ")}
            <br />
            <span className="text-accent">
              {t("hero_title").split(" ").slice(2).join(" ")}
            </span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-xl mx-auto">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/menu"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-lg"
            >
              {t("cta_menu")}
            </Link>
            <a
              href="#how-it-works"
              className="border border-border hover:border-muted text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-lg"
            >
              {t("cta_how")}
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-8">
          {t("featured_title")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : featured?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-12 text-center">
          {t("steps_title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <step.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-8 text-center">
          {t("zones_title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { zone: "< 3 km", fee: t("zone_free"), min: "1 500 ₸" },
            { zone: "3–7 km", fee: "500 ₸", min: "2 000 ₸" },
            { zone: "7–12 km", fee: "1 000 ₸", min: "3 000 ₸" },
          ].map((z) => (
            <div
              key={z.zone}
              className="bg-surface border border-border rounded-2xl p-6 text-center space-y-2"
            >
              <p className="text-lg font-semibold">{z.zone}</p>
              <p className="text-accent text-2xl font-bold">{z.fee}</p>
              <p className="text-muted text-sm">
                {t("zone_min")} {z.min}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contacts" className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">Sushi</h3>
            <p className="text-muted text-sm">{t("footer_desc")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{t("footer_address_title")}</h3>
            <p className="text-muted text-sm">ул. Примерная, 42</p>
            <p className="text-muted text-sm">г. Астана</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">{t("footer_contacts_title")}</h3>
            <p className="text-muted text-sm">+7 (777) 123-45-67</p>
            <p className="text-muted text-sm mt-1">10:00 – 23:00</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
