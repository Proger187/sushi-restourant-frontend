"use client";

import Link from "next/link";
import { UtensilsCrossed, CreditCard, Truck } from "lucide-react";
import { useProducts } from "@/lib/queries";
import ProductCard from "@/components/menu/ProductCard";
import ProductCardSkeleton from "@/components/menu/ProductCardSkeleton";

const steps = [
  {
    icon: UtensilsCrossed,
    title: "Выберите блюда",
    description: "Выберите из нашего меню свежих суши и роллов",
  },
  {
    icon: CreditCard,
    title: "Оформите заказ",
    description: "Укажите адрес доставки и способ оплаты",
  },
  {
    icon: Truck,
    title: "Получите доставку",
    description: "Курьер доставит заказ прямо к вашей двери",
  },
];

export default function Home() {
  const { data: featured, isLoading } = useProducts(undefined, true);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-background via-surface to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        <div className="relative text-center px-4 max-w-3xl mx-auto space-y-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl font-bold leading-tight">
            Свежие суши
            <br />
            <span className="text-accent">с доставкой</span>
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-xl mx-auto">
            Готовим из свежих ингредиентов и доставляем прямо к вашей двери
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/menu"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-lg"
            >
              Смотреть меню
            </Link>
            <a
              href="#how-it-works"
              className="border border-border hover:border-muted text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-lg"
            >
              Как заказать
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-8">
          Популярное
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

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-12 text-center">
          Как это работает
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <step.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery Info */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-8 text-center">
          Зоны доставки
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { zone: "до 3 км", fee: "Бесплатно", min: "от 1 500 ₸" },
            { zone: "3–7 км", fee: "500 ₸", min: "от 2 000 ₸" },
            { zone: "7–12 км", fee: "1 000 ₸", min: "от 3 000 ₸" },
          ].map((z) => (
            <div
              key={z.zone}
              className="bg-surface border border-border rounded-2xl p-6 text-center space-y-2"
            >
              <p className="text-lg font-semibold">{z.zone}</p>
              <p className="text-accent text-2xl font-bold">{z.fee}</p>
              <p className="text-muted text-sm">Мин. заказ {z.min}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contacts" className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">🍣 Sushi</h3>
            <p className="text-muted text-sm">
              Свежие суши и роллы с доставкой по городу
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Адрес</h3>
            <p className="text-muted text-sm">ул. Примерная, 42</p>
            <p className="text-muted text-sm">г. Астана</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Контакты</h3>
            <p className="text-muted text-sm">+7 (777) 123-45-67</p>
            <p className="text-muted text-sm mt-1">Пн–Вс: 10:00 – 23:00</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
