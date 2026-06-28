export default function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-square bg-border" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-border rounded w-3/4" />
        <div className="h-4 bg-border rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-6 bg-border rounded w-20" />
          <div className="h-9 bg-border rounded w-24" />
        </div>
      </div>
    </div>
  );
}
