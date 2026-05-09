export default function ProductCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-luxury-500/10 bg-surface-card"
      aria-hidden
    >
      {/* Image placeholder — matches aspect-[3/4] */}
      <div className="aspect-[3/4] animate-pulse bg-surface-hover" />
      {/* Content placeholder */}
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-hover" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-hover" />
        <div className="space-y-1.5 pt-0.5">
          <div className="h-8 w-full animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
