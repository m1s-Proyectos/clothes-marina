import { useEffect, useState } from "react";

/** Productos entre carruseles: 4 en móvil, 6 en tablet/desktop. */
const MOBILE_INTERVAL = 4;
const TABLET_DESKTOP_INTERVAL = 6;
const MD_QUERY = "(min-width: 768px)";

export function useCarouselInsertInterval(): number {
  const [interval, setInterval] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(MD_QUERY).matches
      ? TABLET_DESKTOP_INTERVAL
      : MOBILE_INTERVAL,
  );

  useEffect(() => {
    const mq = window.matchMedia(MD_QUERY);
    const update = () => setInterval(mq.matches ? TABLET_DESKTOP_INTERVAL : MOBILE_INTERVAL);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return interval;
}
