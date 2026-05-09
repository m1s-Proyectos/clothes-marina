import { useEffect, useState } from "react";
import { adminInboxService } from "@/services/adminInboxService";
import type { ContactRequest, WhatsAppLead } from "@/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

const txt = {
  primary: "text-[#1f1f1d]",
  secondary: "text-[#4f4f4b]",
  muted: "text-[#6a6a66]"
} as const;

export default function AdminInboxPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [whatsAppLeads, setWhatsAppLeads] = useState<WhatsAppLead[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(): Promise<void> {
    const [contactRows, leadRows] = await Promise.all([
      adminInboxService.listContactRequests(),
      adminInboxService.listWhatsAppLeads()
    ]);
    setContacts(contactRows);
    setWhatsAppLeads(leadRows);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-8">
      <div>
        <h1 className={`text-2xl font-semibold ${txt.primary}`}>Inbox de contacto</h1>
        <p className={`mt-2 text-sm ${txt.secondary}`}>Revisa solicitudes del formulario y alertas de WhatsApp por producto.</p>
      </div>

      <div>
        <h2 className={`text-xl font-semibold ${txt.primary}`}>Solicitudes de contacto</h2>
        {loading ? (
          <p className={`mt-3 text-sm ${txt.muted}`}>Cargando...</p>
        ) : contacts.length === 0 ? (
          <p className={`mt-3 text-sm ${txt.muted}`}>No hay solicitudes aún.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {contacts.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`font-semibold ${txt.primary}`}>
                    {request.name} — {request.phone}
                  </p>
                  <p className={`text-xs ${txt.muted}`}>{formatDate(request.created_at)}</p>
                </div>
                <p className={`mt-2 text-sm leading-relaxed ${txt.secondary}`}>{request.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-md px-2 py-1 font-medium ${
                      request.status === "resolved" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {request.status === "resolved" ? "Resuelto" : "Nuevo"}
                  </span>
                  {request.status !== "resolved" && (
                    <button
                      type="button"
                      onClick={() => void adminInboxService.markContactResolved(request.id).then(load)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-[#1f1f1d] transition hover:bg-slate-50"
                    >
                      Marcar resuelto
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className={`text-xl font-semibold ${txt.primary}`}>Alertas WhatsApp por producto</h2>
        {loading ? (
          <p className={`mt-3 text-sm ${txt.muted}`}>Cargando...</p>
        ) : whatsAppLeads.length === 0 ? (
          <p className={`mt-3 text-sm ${txt.muted}`}>No hay alertas aún.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {whatsAppLeads.map((lead) => (
              <article key={lead.id} className="rounded-xl border border-slate-200/90 bg-white p-4 text-sm shadow-sm">
                <p className={`font-semibold ${txt.primary}`}>{lead.product_name}</p>
                <p className={`mt-1 text-xs ${txt.muted}`}>{formatDate(lead.created_at)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
