import env from "@/config/env";

export default function FloatingWhatsAppButton() {
  const url = `https://wa.me/${env.whatsappPhone}?text=${encodeURIComponent("Hola, necesito informacion sobre su catalogo.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-center gap-1"
    >
      <span className="rounded-full bg-neutral-900/80 px-3 py-1 text-xs font-medium text-white shadow backdrop-blur-sm">
        No encuentras algo? preguntanos en WhatsApp
      </span>
      <span className="rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-600">
        WhatsApp
      </span>
    </a>
  );
}
