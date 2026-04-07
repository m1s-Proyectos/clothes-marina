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

const SCROLL_SPEED_PX_S = 26;

export default function CategoryMarqueePanel({ items }: CategoryMarqueePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureLoopRef = useRef<() => void>(() => {});
  const [loopHalfWidth, setLoopHalfWidth] = useState(0);
  const [touchPause, setTouchPause] = useState(false);
  const [wheelPause, setWheelPause] = useState(false);
  const [focusWithinPause, setFocusWithinPause] = useState(false);
  const touchEndTimerRef = useRef<number>(0);
  const wheelEndTimerRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  const loopItems = items.length > 0 ? [...items, ...items] : [];

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) {
      setLoopHalfWidth(0);
      return;
    }
    const measure = () => {
      const w = el.scrollWidth / 2;
      if (w > 0) setLoopHalfWidth(w);
    };
    measureLoopRef.current = measure;

    const measureSoon = () => {
      measure();
      requestAnimationFrame(() => {
        measure();
        requestAnimationFrame(measure);
      });
    };

    measureSoon();
    const ro = new ResizeObserver(() => measureSoon());
    ro.observe(el);
    window.addEventListener("resize", measureSoon);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureSoon);
    };
  }, [items]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, [items]);

  useEffect(() => {
    if (reducedMotion || touchPause || wheelPause || focusWithinPause || loopHalfWidth <= 0) return;

    let cancelled = false;
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const el = scrollRef.current;
      if (el) {
        const dt = Math.min((now - last) / 1000, 0.08);
        last = now;
        el.scrollLeft += SCROLL_SPEED_PX_S * dt;
        if (el.scrollLeft >= loopHalfWidth - 0.5) {
          el.scrollLeft -= loopHalfWidth;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, touchPause, wheelPause, focusWithinPause, loopHalfWidth, items.length]);

  useEffect(() => {
    return () => {
      window.clearTimeout(touchEndTimerRef.current);
      window.clearTimeout(wheelEndTimerRef.current);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="relative" aria-labelledby="home-categories-heading">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="home-categories-heading" className="section-title mb-0 text-luxury-50">
            Categorías
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Se desplaza solo; puedes arrastrar o usar la rueda para ir a una categoría. Se detiene un momento al tocar o
            arrastrar.
          </p>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-luxury-500/20 bg-surface-card/60 shadow-[inset_0_1px_0_rgba(200,166,108,0.08)] ring-1 ring-luxury-500/10 backdrop-blur-sm"
        onFocusCapture={() => setFocusWithinPause(true)}
        onBlurCapture={(event) => {
          const next = event.relatedTarget as Node | null;
          if (next && event.currentTarget.contains(next)) return;
          setFocusWithinPause(false);
        }}
        onTouchStart={() => {
          window.clearTimeout(touchEndTimerRef.current);
          setTouchPause(true);
        }}
        onTouchEnd={() => {
          window.clearTimeout(touchEndTimerRef.current);
          touchEndTimerRef.current = window.setTimeout(() => setTouchPause(false), 2200);
        }}
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
            onWheel={() => {
              setWheelPause(true);
              window.clearTimeout(wheelEndTimerRef.current);
              wheelEndTimerRef.current = window.setTimeout(() => setWheelPause(false), 900);
            }}
            className="cursor-grab overflow-x-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(200,166,108,0.35)_transparent] active:cursor-grabbing sm:px-5 sm:py-5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-luxury-500/35 [&::-webkit-scrollbar-track]:bg-transparent"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {/* minWidth: si todas las tarjetas caben en pantalla, igual hay scroll horizontal (sin esto scrollLeft no avanza). */}
            <div className="flex w-max min-w-[calc(100%+2.5rem)] gap-3 sm:gap-4">
            {loopItems.map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                to={`/catalog/${item.slug}`}
                style={{ scrollSnapAlign: "center" }}
                className="group relative h-[88px] w-[148px] shrink-0 overflow-hidden rounded-xl border border-luxury-500/15 bg-surface-raised transition duration-300 hover:border-luxury-400/45 hover:shadow-lg hover:shadow-luxury-900/25 sm:h-[96px] sm:w-[168px]"
              >
                {item.imageUrl ? (
                  <OptimizedImage
                    src={item.imageUrl}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => measureLoopRef.current()}
                    className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-luxury-900/50 via-surface-raised to-surface-base"
                    aria-hidden
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/35 to-transparent" />
                <span className="relative z-10 flex h-full flex-col justify-end p-3 font-serif text-lg leading-tight tracking-wide text-luxury-50 drop-shadow-md sm:text-xl">
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
