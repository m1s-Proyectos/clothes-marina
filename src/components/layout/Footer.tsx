import { Link } from "react-router-dom";

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1938!2d-88.6267605!3d13.8750103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f64bd73f2760a5d%3A0xd831d79262120471!2sMarina's%20clothes!5e0!3m2!1ses!2ssv";
const MAPS_LINK = "https://maps.app.goo.gl/XoaFDLwfJ3PXWzvC9";

const QUICK_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/catalog", label: "Catalogo" },
  { to: "/collections", label: "Novedades" },
  { to: "/contact", label: "Contacto" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.955 1.938A10.017 10.017 0 002 11.955C2 14.73 2.8 17.32 4.2 19.5L2 22l2.6-1.9A10 10 0 1011.955 1.938z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-luxury-500/10 bg-surface-base pb-24 pt-14 md:pb-14">
      <div className="container-shell">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand + address column */}
          <div className="space-y-5">
            <p className="inline-block rounded-full border border-luxury-500/30 bg-surface-card/50 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-luxury-300">
              Visitanos
            </p>
            <h3 className="font-serif text-4xl text-luxury-100">Marina&apos;s Clothes</h3>
            <p className="max-w-md text-sm leading-relaxed text-neutral-400">
              Tienda física con selección de prendas para toda la familia. Estamos listos para atenderte.
            </p>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-luxury-400 px-6 py-2.5 text-sm font-semibold text-surface-base transition hover:-translate-y-0.5 hover:bg-luxury-300 hover:shadow-lg hover:shadow-luxury-900/20"
            >
              Abrir en Google Maps
            </a>
          </div>

          {/* Quick links column */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-300">Navegación</p>
            <nav aria-label="Links rápidos del footer">
              <ul className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-neutral-400 transition hover:text-luxury-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social icons */}
            <div className="pt-2">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-luxury-300">Síguenos</p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="rounded-lg border border-luxury-500/20 p-2 text-neutral-400 transition hover:border-luxury-400/40 hover:text-luxury-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Map column */}
          <div className="overflow-hidden rounded-2xl border border-luxury-500/15 shadow-lg shadow-black/20">
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

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-luxury-500/8 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-neutral-500">Marina&apos;s Clothes © {new Date().getFullYear()}</p>
          <p className="text-xs text-neutral-600">Estilo de calidad para todos los días.</p>
        </div>
      </div>
    </footer>
  );
}
