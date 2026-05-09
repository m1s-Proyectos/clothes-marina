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
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-luxury-200/70 bg-white/95 p-3 shadow-lg shadow-luxury-900/10 backdrop-blur-lg">
      <div className="container-shell">
        <button
          type="button"
          onClick={() => {
            onClose();
            window.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full rounded-xl bg-luxury-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-luxury-700"
        >
          Volver al sitio
        </button>
      </div>
    </div>,
    document.body
  );
}
