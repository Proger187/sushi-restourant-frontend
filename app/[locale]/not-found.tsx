import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-[family-name:var(--font-playfair)] text-6xl font-bold">404</h1>
      <p className="text-muted text-lg">Page not found</p>
      <Link href="/menu" className="mt-4 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        Go to menu
      </Link>
    </main>
  );
}
