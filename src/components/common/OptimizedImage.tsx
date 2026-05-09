import { useEffect, useMemo, useState, type ImgHTMLAttributes } from "react";
import { getOptimizedImageUrl, isSupabasePublicImage, type ImageTransformOptions } from "@/utils/image";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  transform?: ImageTransformOptions;
  responsiveWidths?: number[];
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Crect width='4' height='5' fill='%23f7f5f2'/%3E%3C/svg%3E";

export default function OptimizedImage({ src, transform, responsiveWidths, ...imgProps }: OptimizedImageProps) {
  const safeSrc = src || FALLBACK_IMAGE;
  const canOptimize = Boolean(transform) && isSupabasePublicImage(safeSrc);
  const optimizedSrc = useMemo(
    () => (canOptimize ? getOptimizedImageUrl(safeSrc, transform) : safeSrc),
    [canOptimize, safeSrc, transform],
  );

  const [currentSrc, setCurrentSrc] = useState(optimizedSrc);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(optimizedSrc);
    setUseFallback(false);
  }, [optimizedSrc]);

  const srcSet =
    !useFallback && canOptimize && responsiveWidths && responsiveWidths.length > 0
      ? responsiveWidths
          .map((width) => `${getOptimizedImageUrl(safeSrc, { ...transform, width })} ${width}w`)
          .join(", ")
      : undefined;

  return (
    <img
      {...imgProps}
      src={currentSrc}
      srcSet={srcSet}
      onError={(event) => {
        if (useFallback || currentSrc === safeSrc) {
          imgProps.onError?.(event);
          return;
        }

        setUseFallback(true);
        setCurrentSrc(safeSrc);
        imgProps.onError?.(event);
      }}
    />
  );
}
