import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import OptimizedImage from "@/components/common/OptimizedImage";

export interface CategoryMarqueeItem {
  title: string;
  slug: string;
  /** URL de imagen de categoría (Supabase u otra); si falta, se usa un fondo degradado. */
  imageUrl: string;
}

interface CategoryMarqueePanelProps {
  items: CategoryMarqueeItem[];
}

/** Velocidad del carrusel (px/s). */
const AUTO_SCROLL_PX_PER_SEC = 24;

export default function CategoryMarqueePanel({ items }: CategoryMarqueePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<() => void>(() => {});
  const [loopSegmentPx, setLoopSegmentPx] = useState(0);
  const [interactionPause, setInteractionPause] = useState(false);
  const wheelTimerRef = useRef<number>(0);
  const touchEndTimerRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  const loopItems = items.length > 0 ? [...items, ...items] : [];

  /** Mitad del scroll total = longitud de una copia del listado (bucle infinito). */
  const measureLoopSegment = () => {
    const el = scrollRef.current;
    if (!el || items.length === 0) {
      setLoopSegmentPx(0);
      return;
    }
    const half = el.scrollWidth / 2;
    if (half > 0) setLoopSegmentPx(half);
  };

  measureRef.current = measureLoopSegment;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) {
      setLoopSegmentPx(0);
      return;
    }

    const runMeasure = () => {
      measureLoopSegment();
      requestAnimationFrame(() => {
        measureLoopSegment();
        requestAnimationFrame(measureLoopSegment);
      });
    };

    runMeasure();
    const ro = new ResizeObserver(() => runMeasure());
    ro.observe(el);
    window.addEventListener("resize", runMeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", runMeasure);
    };
  }, [items]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, [items]);

  useEffect(() => {
    if (reducedMotion || interactionPause || loopSegmentPx <= 0) return;

    let cancelled = false;
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const el = scrollRef.current;
      if (el && loopSegmentPx > 0) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        el.scrollLeft += AUTO_SCROLL_PX_PER_SEC * dt;
        if (el.scrollLeft >= loopSegmentPx - 0.5) {
          el.scrollLeft -= loopSegmentPx;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, interactionPause, loopSegmentPx, items.length]);

  useEffect(() => {
    return () => {
      window.clearTimeout(wheelTimerRef.current);
      window.clearTimeout(touchEndTimerRef.current);
    };
  }, []);

  const pauseFromWheel = () => {
    setInteractionPause(true);
    window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => setInteractionPause(false), 1000);
  };

  const pauseFromTouch = () => {
    setInteractionPause(true);
    window.clearTimeout(touchEndTimerRef.current);
    touchEndTimerRef.current = window.setTimeout(() => setInteractionPause(false), 2200);
  };

  if (items.length === 0) return null;

  return (
    <section className="relative" aria-labelledby="home-categories-heading">
      <h2 id="home-categories-heading" className="section-title mb-3 text-luxury-50">
        Categorías
      </h2>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-neutral-400 sm:text-base">
        Puedes arrastrar o usar la rueda para ir a una categoría. Selecciona una categoría si deseas una en específico.
      </p>

      <div
        className="relative overflow-hidden rounded-2xl border border-luxury-500/20 bg-surface-card/60 shadow-[inset_0_1px_0_rgba(200,166,108,0.08)] ring-1 ring-luxury-500/10 backdrop-blur-sm"
        onTouchStart={pauseFromTouch}
        onTouchEnd={pauseFromTouch}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-surface-card to-transparent sm:w-14"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-surface-card to-transparent sm:w-14"
          aria-hidden
        />

        <nav aria-label="Categorías del catálogo" className="relative">
          <div
            ref={scrollRef}
            onWheel={pauseFromWheel}
            className="cursor-grab overflow-x-auto px-4 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(200,166,108,0.35)_transparent] active:cursor-grabbing sm:px-6 sm:py-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-luxury-500/35 [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {/* Sin esto, en pantallas anchas todo cabe y scrollLeft no puede moverse: el auto-scroll no se ve. */}
            <div className="flex w-max min-w-[calc(100%+3rem)] gap-4 sm:gap-5">
              {loopItems.map((item, index) => (
                <Link
                  key={`${item.slug}-${index}`}
                  to={`/catalog/${item.slug}`}
                  className="group relative h-[118px] w-[168px] shrink-0 overflow-hidden rounded-xl border border-luxury-500/15 bg-surface-raised transition duration-300 hover:border-luxury-400/45 hover:shadow-lg hover:shadow-luxury-900/25 sm:h-[140px] sm:w-[200px]"
                >
                  {item.imageUrl ? (
                    <OptimizedImage
                      src={item.imageUrl}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => measureRef.current()}
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-luxury-900/50 via-surface-raised to-surface-base"
                      aria-hidden
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/40 to-transparent" />
                  <span className="relative z-10 flex h-full flex-col justify-end p-3.5 font-serif text-xl leading-tight tracking-wide text-luxury-50 drop-shadow-md sm:p-4 sm:text-2xl">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </section>
  );
}
