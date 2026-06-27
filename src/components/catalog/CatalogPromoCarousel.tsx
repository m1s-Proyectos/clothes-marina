import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInView, useReducedMotion } from "framer-motion";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { CatalogCarouselBlock, CatalogCarouselSlide } from "@/types/catalogCarousel";

interface CatalogPromoCarouselProps {
  block: CatalogCarouselBlock;
  className?: string;
}

const AUTO_SCROLL_PX_PER_SEC = 28;
const MAX_LOOP_COPIES = 10;

/** Más copias cuando hay pocos slides: evita que el track no tenga overflow scrollable. */
function getInitialCopyCount(slideCount: number): number {
  if (slideCount <= 2) return 5;
  if (slideCount <= 3) return 4;
  if (slideCount <= 5) return 3;
  return 2;
}

interface PromoSlideCardProps {
  slide: CatalogCarouselSlide;
  tone?: "light" | "dark";
  onImageLoad?: () => void;
}

/**
 * Banner promocional tipo tarjeta editorial:
 * - Zona superior: imagen completa (object-contain) sobre fondo neutro.
 * - Zona inferior: texto con fondo sólido/degradado (protagonista, sin competir con la foto).
 */
function PromoSlideCard({ slide, tone = "light", onImageLoad }: PromoSlideCardProps) {
  const headline = slide.title ?? slide.subtitle;
  const supporting = slide.description ?? (slide.subtitle && slide.title ? slide.subtitle : undefined);
  const isDark = tone === "dark";

  const cardClass = [
    "group flex w-[11.75rem] shrink-0 flex-col overflow-hidden rounded-2xl border shadow-md ring-1",
    "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl",
    "min-h-[8.5rem] md:w-[14.5rem] md:min-h-[10.5rem]",
    isDark
      ? "border-slate-600/45 bg-slate-900 shadow-slate-950/30 ring-slate-700/25 hover:shadow-slate-950/40"
      : "border-luxury-200/80 bg-white shadow-luxury-900/10 ring-luxury-100/80 hover:shadow-luxury-900/18",
  ].join(" ");

  const imageZoneClass = isDark
    ? "relative flex min-h-[5rem] max-h-[6.5rem] flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 p-1.5 md:min-h-[6.5rem] md:max-h-[8rem] md:p-2"
    : "relative flex min-h-[5rem] max-h-[6.5rem] flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-luxury-50/90 via-white to-luxury-50/50 p-1.5 md:min-h-[6.5rem] md:max-h-[8rem] md:p-2";

  const textZoneClass = isDark
    ? "shrink-0 border-t border-slate-700/55 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2.5 py-2 md:px-3 md:py-2.5"
    : "shrink-0 border-t border-slate-800/8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-2.5 py-2 md:px-3 md:py-2.5";

  const headlineClass =
    "font-serif text-[0.8125rem] font-semibold leading-snug text-white md:text-[0.9375rem]";

  const supportingClass = "mt-0.5 line-clamp-2 text-[9px] leading-snug text-white/82 md:text-[10px]";

  const inner = (
    <>
      <div className={imageZoneClass}>
        <OptimizedImage
          src={slide.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => onImageLoad?.()}
          transform={{ width: 360, quality: 76, format: "webp", resize: "contain" }}
          responsiveWidths={[160, 240, 320, 360]}
          sizes="(max-width: 767px) 11.75rem, 14.5rem"
          className="h-full w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className={textZoneClass}>
        {headline ? <p className={headlineClass}>{headline}</p> : null}
        {supporting ? <p className={supportingClass}>{supporting}</p> : null}
      </div>
    </>
  );

  if (slide.href) {
    return (
      <Link to={slide.href} className={cardClass} aria-label={headline ?? "Ver más"}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cardClass} role="group" aria-label={headline ?? "Contenido editorial"}>
      {inner}
    </div>
  );
}

export default function CatalogPromoCarousel({ block, className = "" }: CatalogPromoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<() => void>(() => {});
  const [copyCount, setCopyCount] = useState(() => getInitialCopyCount(block.slides.length));
  const [loopSegmentPx, setLoopSegmentPx] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [interactionPause, setInteractionPause] = useState(false);
  const wheelTimerRef = useRef<number>(0);
  const touchEndTimerRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();
  const isInView = useInView(scrollRef, { amount: 0.15, margin: "80px 0px" });

  const slides = block.slides;
  const loopSlides =
    slides.length > 0 ? Array.from({ length: copyCount }, () => slides).flat() : [];

  useEffect(() => {
    setCopyCount(getInitialCopyCount(slides.length));
    setLoopSegmentPx(0);
    setCanScroll(false);
  }, [block.id, slides.length]);

  const measureLoopSegment = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slides.length === 0) {
      setLoopSegmentPx(0);
      setCanScroll(false);
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll < 4) {
      setLoopSegmentPx(0);
      setCanScroll(false);
      if (copyCount < MAX_LOOP_COPIES) {
        setCopyCount((count) => Math.min(count + 1, MAX_LOOP_COPIES));
      }
      return;
    }

    const segment = el.scrollWidth / copyCount;
    if (segment > 0) {
      setLoopSegmentPx(segment);
      setCanScroll(true);
    }
  }, [slides.length, copyCount]);

  measureRef.current = measureLoopSegment;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el || slides.length === 0) {
      setLoopSegmentPx(0);
      setCanScroll(false);
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
    if (inner) ro.observe(inner);
    window.addEventListener("resize", runMeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", runMeasure);
    };
  }, [slides, copyCount, measureLoopSegment, isInView]);

  useEffect(() => {
    if (!isInView) return;
    measureRef.current();
  }, [isInView, loopSlides.length, measureLoopSegment]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, [block.id, slides]);

  useEffect(() => {
    if (reducedMotion || interactionPause || !canScroll || loopSegmentPx <= 0 || !isInView) return;

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
  }, [reducedMotion, interactionPause, canScroll, loopSegmentPx, isInView, slides.length, block.id]);

  useEffect(() => {
    return () => {
      window.clearTimeout(wheelTimerRef.current);
      window.clearTimeout(touchEndTimerRef.current);
    };
  }, []);

  const pauseBriefly = (ms: number) => {
    setInteractionPause(true);
    window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => setInteractionPause(false), ms);
  };

  const pauseFromWheel = () => pauseBriefly(1200);

  const pauseFromTouch = () => {
    setInteractionPause(true);
    window.clearTimeout(touchEndTimerRef.current);
    touchEndTimerRef.current = window.setTimeout(() => setInteractionPause(false), 2400);
  };

  if (slides.length === 0) return null;

  const isWorldCup = block.type === "world-cup-2026";

  return (
    <section
      className={`catalog-promo-carousel relative min-w-0 overflow-hidden rounded-xl border p-2 shadow-sm ring-1 md:rounded-2xl md:p-3 ${
        isWorldCup
          ? "border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-slate-950/25 ring-slate-600/30"
          : "border-sky-200/30 bg-[#eef4f8] shadow-slate-900/5 ring-slate-200/40"
      } ${className}`}
      aria-label={block.sectionTitle}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 55% 70% at 50% 100%, rgba(100, 157, 183, 0.08), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative z-[1]">
        <div className="mb-2 px-0.5 md:mb-2.5">
          <h3
            className={`text-xs font-semibold tracking-tight md:text-sm ${
              isWorldCup ? "text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]" : "text-slate-800"
            }`}
          >
            {block.sectionTitle}
          </h3>
          {block.sectionMessage ? (
            <p
              className={`mt-0.5 text-[10px] leading-snug md:text-xs ${
                isWorldCup ? "text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]" : "text-slate-500"
              }`}
            >
              {block.sectionMessage}
            </p>
          ) : null}
        </div>

        <div className="relative min-w-0">
          <div
            ref={scrollRef}
            onWheel={pauseFromWheel}
            onMouseEnter={() => setInteractionPause(true)}
            onMouseLeave={() => setInteractionPause(false)}
            onTouchStart={pauseFromTouch}
            onTouchEnd={pauseFromTouch}
            className="catalog-promo-carousel__track min-w-0 overflow-x-auto px-0.5 py-1 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          >
            <div
              ref={innerRef}
              className="flex w-max min-w-[calc(100%+3rem)] gap-3 md:gap-4"
            >
              {loopSlides.map((slide, index) => (
                <PromoSlideCard
                  key={`${slide.id}-${index}`}
                  slide={slide}
                  tone={isWorldCup ? "dark" : "light"}
                  onImageLoad={() => measureRef.current()}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
