export default function ProductCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-luxury-500/10 bg-surface-card"
      aria-hidden
    >
      {/* Image placeholder */}
      <div className="aspect-[4/5] animate-pulse bg-surface-hover" />
      {/* Content placeholder */}
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-10 w-1/2 animate-pulse rounded-lg bg-surface-hover" />
        <div className="space-y-2 pt-1">
          <div className="h-9 w-full animate-pulse rounded-xl bg-surface-hover" />
          <div className="h-9 w-full animate-pulse rounded-xl bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
