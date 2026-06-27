import { useCallback, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/common/OptimizedImage";

type ProductImageOrientation = "portrait" | "square" | "landscape";

function detectOrientation(naturalWidth: number, naturalHeight: number): ProductImageOrientation {
  if (!naturalWidth || !naturalHeight) return "portrait";
  const ratio = naturalWidth / naturalHeight;
  if (ratio >= 1.12) return "landscape";
  if (ratio >= 0.88) return "square";
  return "portrait";
}

const ORIENTATION_MEDIA_CLASS: Record<ProductImageOrientation, string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[5/4]",
};

interface CatalogProductCardMediaProps {
  src: string;
  alt: string;
  productUrl: string;
}

/**
 * Contenedor de imagen para catálogo 2 columnas (móvil).
 * La altura escala con el ancho de la columna (aspect-ratio), sin alturas fijas.
 * object-contain muestra la prenda completa, como en el layout de 1 columna.
 */
export default function CatalogProductCardMedia({ src, alt, productUrl }: CatalogProductCardMediaProps) {
  const [orientation, setOrientation] = useState<ProductImageOrientation>("portrait");

  const handleImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setOrientation(detectOrientation(naturalWidth, naturalHeight));
  }, []);

  return (
    <Link
      to={productUrl}
      className={`catalog-product-card__media group/media relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-luxury-50/90 to-white p-1.5 md:aspect-[4/5] md:p-3 ${ORIENTATION_MEDIA_CLASS[orientation]} md:flex md:items-center md:justify-center`}
      aria-label={`Ver detalles de ${alt}`}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
        transform={{ width: 280, quality: 74, format: "webp", resize: "contain" }}
        responsiveWidths={[120, 180, 240, 280, 360]}
        sizes="(max-width: 767px) 46vw, (max-width: 1024px) 50vw, 33vw"
        className="catalog-product-card__img max-h-full max-w-full object-contain object-center transition-transform duration-300 md:h-full md:w-full md:group-hover/media:scale-[1.03]"
      />
    </Link>
  );
}
