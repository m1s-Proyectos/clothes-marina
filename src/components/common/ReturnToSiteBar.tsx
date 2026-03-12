interface ReturnToSiteBarProps {
  onClose: () => void;
}

export default function ReturnToSiteBar({ onClose }: ReturnToSiteBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-luxury-700 bg-neutral-900/95 p-3 backdrop-blur">
      <div className="container-shell">
        <button
          type="button"
          onClick={() => {
            onClose();
            window.focus();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full rounded bg-luxury-500 px-4 py-3 text-sm font-semibold text-neutral-950 hover:bg-luxury-400"
        >
          Volver al sitio
        </button>
      </div>
    </div>
  );
}
