"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold">Something went wrong</h1>
      <p className="text-muted">An error occurred while loading the page</p>
      <button onClick={reset} className="mt-4 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        Try again
      </button>
    </main>
  );
}
