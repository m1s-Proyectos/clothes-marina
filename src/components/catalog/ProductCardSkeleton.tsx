export default function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      {/* Image placeholder */}
      <div className="aspect-[3/4] w-full animate-pulse bg-surface-hover" />
      {/* Caption placeholder — mirrors name (2 lines) + price+button row */}
      <div className="pt-2">
        <div className="h-3 w-4/5 animate-pulse rounded bg-surface-hover" />
        <div className="mt-1 h-3 w-3/5 animate-pulse rounded bg-surface-hover" />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-hover" />
          <div className="h-[44px] w-[44px] animate-pulse rounded-lg bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
