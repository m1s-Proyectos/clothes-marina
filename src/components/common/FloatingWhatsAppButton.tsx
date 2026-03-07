import env from "@/config/env";

export default function FloatingWhatsAppButton() {
  const url = `https://wa.me/${env.whatsappPhone}?text=${encodeURIComponent("Hello, I need information about your catalog.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-600"
    >
      WhatsApp
    </a>
  );
}
