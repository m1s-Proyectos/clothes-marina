import { useEffect, useId, type ComponentType } from "react";
import { createPortal } from "react-dom";
import {
  getFacebookShareUrl,
  getMessengerShareUrl,
  getTwitterShareUrl,
  getWhatsAppProductUrl,
  runInstagramShareFlow,
  type ShareParams,
} from "@/utils/share";
import {
  IconFacebook,
  IconInstagram,
  IconMessenger,
  IconWhatsApp,
  IconX,
} from "@/components/product/ShareBrandIcons";

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareParams: ShareParams;
  onAfterOpenShare: () => void;
  onInstagramNote: (message: string) => void;
}

type ShareOptionId = "whatsapp" | "facebook" | "messenger" | "x" | "instagram";

const options: {
  id: ShareOptionId;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  className: string;
}[] = [
  { id: "whatsapp", label: "WhatsApp", Icon: IconWhatsApp, className: "bg-[#25D366] text-white hover:brightness-110" },
  { id: "facebook", label: "Facebook", Icon: IconFacebook, className: "bg-[#1877F2] text-white hover:brightness-110" },
  { id: "messenger", label: "Messenger", Icon: IconMessenger, className: "bg-[#0099FF] text-white hover:brightness-110" },
  { id: "x", label: "X", Icon: IconX, className: "bg-neutral-900 text-white hover:bg-neutral-800" },
  {
    id: "instagram",
    label: "Instagram",
    Icon: IconInstagram,
    className: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white hover:brightness-110",
  },
];

export default function ProductShareModal({
  isOpen,
  onClose,
  shareParams,
  onAfterOpenShare,
  onInstagramNote,
}: ProductShareModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function openUrl(url: string): void {
    window.open(url, "_blank", "noopener,noreferrer");
    onAfterOpenShare();
  }

  async function handleAction(id: ShareOptionId): Promise<void> {
    switch (id) {
      case "whatsapp":
        openUrl(getWhatsAppProductUrl(shareParams));
        onClose();
        break;
      case "facebook":
        openUrl(getFacebookShareUrl(shareParams));
        onClose();
        break;
      case "messenger":
        openUrl(getMessengerShareUrl(shareParams));
        onClose();
        break;
      case "x":
        openUrl(getTwitterShareUrl(shareParams));
        onClose();
        break;
      case "instagram": {
        const note = await runInstagramShareFlow(shareParams);
        if (note) onInstagramNote(note);
        onAfterOpenShare();
        onClose();
        break;
      }
      default:
        break;
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-luxury-500/15 bg-surface-card shadow-2xl shadow-black/40"
      >
        <div className="flex items-start justify-between gap-3 border-b border-luxury-500/10 px-5 py-4">
          <h2 id={titleId} className="pr-2 text-lg font-semibold leading-snug text-luxury-50">
            Compartir en tus redes favoritas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-surface-hover hover:text-neutral-200"
            aria-label="Cerrar ventana"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="max-h-[min(70vh,520px)] space-y-2 overflow-y-auto p-4">
          {options.map(({ id, label, Icon, className }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => void handleAction(id)}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition ${className}`}
                aria-label={`Compartir en ${label}`}
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1 text-base">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
