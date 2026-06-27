import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { productRatingService } from "@/services/productRatingService";
import type { ProductRatingSummary } from "@/types/productRating";
import { cacheProductRating, getCachedProductRating, getRatingSessionId } from "@/utils/ratingSession";

interface ProductRatingSectionProps {
  productId: string;
}

const THANK_MESSAGES = [
  "¡Gracias por ayudarnos a mejorar!",
  "Tu opinión es muy importante para nosotros.",
];

function StarIcon({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function formatAverage(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(1);
}

function formatVoteLabel(count: number): string {
  if (count === 1) return "1 calificación";
  return `${count} calificaciones`;
}

export default function ProductRatingSection({ productId }: ProductRatingSectionProps) {
  const reducedMotion = useReducedMotion();
  const sessionId = useMemo(() => getRatingSessionId(), []);
  const [summary, setSummary] = useState<ProductRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [thankIndex, setThankIndex] = useState(0);
  const [showThanks, setShowThanks] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const yourRating = summary?.your_rating ?? getCachedProductRating(productId);
  const displayRating = hoverRating || yourRating || 0;
  const average = summary?.average_rating;
  const voteCount = summary?.vote_count ?? 0;

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await productRatingService.getSummary(productId, sessionId);
      const cached = getCachedProductRating(productId);
      if (data.your_rating === null && cached !== null) {
        data.your_rating = cached;
      }
      setSummary(data);
    } catch (error) {
      console.warn("Unable to load product ratings.", error);
      setSummary(null);
      setErrorMessage("No pudimos cargar las calificaciones. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }, [productId, sessionId]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  async function handleRate(value: number) {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage("");
    setHoverRating(0);

    try {
      const next = await productRatingService.submitRating(productId, value, sessionId);
      cacheProductRating(productId, value);
      setSummary(next);
      setThankIndex(Math.floor(Math.random() * THANK_MESSAGES.length));
      setShowThanks(true);
      window.setTimeout(() => setShowThanks(false), 3200);
    } catch (error) {
      console.warn("Unable to submit product rating.", error);
      setErrorMessage("No pudimos guardar tu calificación. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="relative mt-6 overflow-hidden rounded-2xl border border-amber-200/45 p-5 shadow-md shadow-amber-900/[0.06] sm:p-6 md:p-7"
      style={{
        background: "linear-gradient(180deg, #fffbeb 0%, #fff8e6 42%, #fffdf5 100%)",
      }}
      aria-labelledby="product-ratings-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(251, 191, 36, 0.16), transparent 58%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(254, 243, 199, 0.55), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative z-[1]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="product-ratings-heading"
              className="flex items-center gap-2 text-lg font-semibold text-slate-950 md:text-xl"
            >
              <span className="text-amber-500" aria-hidden>⭐</span>
              Calificaciones del producto
            </h2>
            <p className="mt-1 text-sm text-slate-600">¿Qué te pareció este producto?</p>
          </div>

          {!loading && voteCount > 0 ? (
            <div className="rounded-xl border border-white/90 bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur-[2px]">
              <div className="flex items-center justify-end gap-1 text-amber-500">
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon
                    key={index}
                    filled={average != null && index < Math.round(average)}
                    className="h-4 w-4"
                  />
                ))}
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatAverage(average ?? null)}{" "}
                <span className="font-normal text-slate-500">({formatVoteLabel(voteCount)})</span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl border border-white/90 bg-white/78 p-4 shadow-sm backdrop-blur-[2px] sm:p-5">
          <p className="text-sm font-semibold text-slate-800">Califica este producto</p>
          <p className="mt-0.5 text-xs text-slate-500">Toca una estrella para calificar</p>

          <div
            className="mt-4 flex items-center gap-1.5 sm:gap-2"
            role="radiogroup"
            aria-label="Calificación del producto"
            onMouseLeave={() => setHoverRating(0)}
          >
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              const active = value <= displayRating;

              return (
                <motion.button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={yourRating === value}
                  aria-label={`${value} estrella${value === 1 ? "" : "s"}`}
                  disabled={submitting}
                  onMouseEnter={() => setHoverRating(value)}
                  onFocus={() => setHoverRating(value)}
                  onBlur={() => setHoverRating(0)}
                  onClick={() => void handleRate(value)}
                  whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          scale: active ? 1.06 : 1,
                          color: active ? "#f59e0b" : "#cbd5e1",
                        }
                  }
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="rounded-lg p-1 transition-colors hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:opacity-60"
                >
                  <StarIcon filled={active} className="h-8 w-8 sm:h-9 sm:w-9" />
                </motion.button>
              );
            })}
          </div>

          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Cargando calificaciones…</p>
          ) : null}

          {yourRating ? (
            <p className="mt-3 text-sm text-slate-600">
              Tu calificación:{" "}
              <span className="font-semibold text-amber-600">
                {yourRating} estrella{yourRating === 1 ? "" : "s"}
              </span>
            </p>
          ) : null}

          {showThanks ? (
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm font-medium text-emerald-700"
            >
              {THANK_MESSAGES[thankIndex]}
            </motion.p>
          ) : null}

          {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}
