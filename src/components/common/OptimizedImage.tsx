import { useEffect, useMemo, useState, type ImgHTMLAttributes } from "react";
import { getOptimizedImageUrl, isSupabasePublicImage, type ImageTransformOptions } from "@/utils/image";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  transform?: ImageTransformOptions;
  responsiveWidths?: number[];
}

export default function OptimizedImage({ src, transform, responsiveWidths, ...imgProps }: OptimizedImageProps) {
  // Some Supabase projects return 403 for image transformation endpoints.
  // Keep direct public URLs enabled for maximum compatibility.
  const canOptimize = false && isSupabasePublicImage(src);
  const optimizedSrc = useMemo(() => (canOptimize ? getOptimizedImageUrl(src, transform) : src), [canOptimize, src, transform]);

  const [currentSrc, setCurrentSrc] = useState(optimizedSrc);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(optimizedSrc);
    setUseFallback(false);
  }, [optimizedSrc]);

  const srcSet =
    !useFallback && canOptimize && responsiveWidths && responsiveWidths.length > 0
      ? responsiveWidths
          .map((width) => `${getOptimizedImageUrl(src, { ...transform, width })} ${width}w`)
          .join(", ")
      : undefined;

  return (
    <img
      {...imgProps}
      src={currentSrc}
      srcSet={srcSet}
      onError={(event) => {
        if (useFallback || currentSrc === src) {
          imgProps.onError?.(event);
          return;
        }

        setUseFallback(true);
        setCurrentSrc(src);
        imgProps.onError?.(event);
      }}
    />
  );
}
