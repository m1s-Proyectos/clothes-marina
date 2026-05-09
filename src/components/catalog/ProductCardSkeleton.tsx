export default function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      {/* Image placeholder */}
      <div className="aspect-[3/4] w-full animate-pulse bg-surface-hover" />
      {/* Caption placeholder */}
      <div className="pt-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-surface-hover" />
        <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-surface-hover" />
      </div>
    </div>
  );
}
