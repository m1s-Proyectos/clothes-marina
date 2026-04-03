import env from "@/config/env";

export default function FloatingWhatsAppButton() {
  const url = `https://wa.me/${env.whatsappPhone}?text=${encodeURIComponent("Hola, necesito información sobre su catálogo.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-1.5"
    >
      <span className="rounded-full bg-surface-card/90 px-3 py-1.5 text-xs font-medium text-neutral-300 shadow-lg backdrop-blur-sm">
        No encuentras algo? preguntanos en WhatsApp
      </span>
      <span className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 hover:shadow-xl">
        WhatsApp
      </span>
    </a>
  );
}
