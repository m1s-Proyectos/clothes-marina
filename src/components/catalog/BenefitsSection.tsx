import { useLayoutEffect, useRef, useState } from "react";

interface BenefitsSectionProps {
  benefits: string[];
  className?: string;
}

function BenefitCheckIcon() {
  return (
    <svg
      className="h-2.5 w-2.5 shrink-0 text-luxury-600 md:h-3 md:w-3"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.5 8.2L6.4 11.1L12.5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Muestra 0–5 beneficios según el espacio libre real en la tarjeta (ResizeObserver). */
export default function BenefitsSection({ benefits, className = "" }: BenefitsSectionProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useLayoutEffect(() => {
    const el = slotRef.current;
    if (!el) return;

    const update = () => {
      const height = el.clientHeight;
      let count = 0;

      if (height >= 88) count = 5;
      else if (height >= 70) count = 4;
      else if (height >= 54) count = 3;
      else if (height >= 36) count = 2;

      setVisibleCount(Math.min(count, benefits.length));
    };

    update();
    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    return () => observer.disconnect();
  }, [benefits]);

  const visibleBenefits = benefits.slice(0, visibleCount);

  return (
    <div
      ref={slotRef}
      className={`product-benefits-slot flex min-h-0 flex-1 flex-col justify-end py-0.5 md:py-1 ${className}`}
      aria-hidden={visibleBenefits.length === 0}
    >
      {visibleBenefits.length > 0 ? (
        <ul
          className="space-y-0.5 rounded-md border border-luxury-100/90 bg-luxury-50/50 px-1.5 py-1 md:space-y-1 md:px-2 md:py-1.5"
          aria-label="Beneficios del producto"
        >
          {visibleBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-1 leading-tight md:gap-1.5">
              <BenefitCheckIcon />
              <span className="text-[9px] font-medium text-slate-600 md:text-[11px]">{benefit}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
