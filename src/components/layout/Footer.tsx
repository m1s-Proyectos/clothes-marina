const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1938!2d-88.6267605!3d13.8750103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f64bd73f2760a5d%3A0xd831d79262120471!2sMarina's%20clothes!5e0!3m2!1ses!2ssv";
const MAPS_LINK = "https://maps.app.goo.gl/XoaFDLwfJ3PXWzvC9";

export default function Footer() {
  return (
    <footer className="border-t border-black/8 bg-white py-14">
      <div className="container-shell">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="inline-block rounded-full border border-luxury-500/40 bg-luxury-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-luxury-600">
              Visitanos
            </p>
            <h3 className="text-4xl text-neutral-900">Marina&apos;s Clothes</h3>
            <p className="max-w-md text-sm leading-relaxed text-neutral-500">
              Tienda fisica con seleccion de prendas para toda la familia. Estamos listos para atenderte.
            </p>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-luxury-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-luxury-600 hover:shadow-lg hover:shadow-luxury-900/15"
            >
              Abrir en Google Maps
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-black/8 shadow-md shadow-black/5">
            <iframe
              src={MAPS_EMBED_URL}
              title="Ubicacion de Marina's Clothes en Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full md:h-64"
              allowFullScreen
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-black/6 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-neutral-400">
            Marina&apos;s Clothes © {new Date().getFullYear()}
          </p>
          <p className="text-xs text-neutral-400">
            Estilo de calidad para todos los dias.
          </p>
        </div>
      </div>
    </footer>
  );
}
