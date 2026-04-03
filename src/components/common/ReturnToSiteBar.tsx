import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ReturnToSiteBarProps {
  onClose: () => void;
}

export default function ReturnToSiteBar({ onClose }: ReturnToSiteBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-luxury-500/15 bg-surface-base/95 p-3 backdrop-blur-lg">
      <div className="container-shell">
        <button
          type="button"
          onClick={() => {
            onClose();
            window.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full rounded-xl bg-luxury-400 px-4 py-3 text-sm font-semibold text-surface-base transition hover:bg-luxury-300"
        >
          Volver al sitio
        </button>
      </div>
    </div>,
    document.body
  );
}
