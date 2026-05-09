export default function ProductCardSkeleton() {
  return (
    <div aria-hidden className="rounded-lg bg-surface-card shadow-sm shadow-black/6 ring-1 ring-black/5">
      {/* Image placeholder */}
      <div className="aspect-[3/4] w-full animate-pulse rounded-t-lg bg-surface-hover" />
      {/* Caption placeholder — mirrors name (2 lines) + price + button row */}
      <div className="px-3 pb-3 pt-2.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-surface-hover" />
        <div className="mt-1 h-3 w-3/5 animate-pulse rounded bg-surface-hover" />
        <div className="mt-1.5">
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-hover" />
          <div className="mt-2.5 h-[44px] w-full animate-pulse rounded-lg bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
