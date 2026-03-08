import { useEffect, useState } from "react";
import { adminInboxService } from "@/services/adminInboxService";
import type { ContactRequest, WhatsAppLead } from "@/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

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
        <h1 className="text-2xl font-semibold">Inbox de Contacto</h1>
        <p className="mt-2 text-neutral-300">Revisa solicitudes del formulario y alertas de WhatsApp por producto.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Solicitudes de contacto</h2>
        {loading ? (
          <p className="mt-3 text-neutral-300">Cargando...</p>
        ) : contacts.length === 0 ? (
          <p className="mt-3 text-neutral-400">No hay solicitudes aun.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {contacts.map((request) => (
              <article key={request.id} className="rounded border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {request.name} - {request.phone}
                  </p>
                  <p className="text-xs text-neutral-400">{formatDate(request.created_at)}</p>
                </div>
                <p className="mt-2 text-sm text-neutral-200">{request.message}</p>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className={`rounded px-2 py-1 ${request.status === "resolved" ? "bg-emerald-900 text-emerald-200" : "bg-amber-900 text-amber-200"}`}>
                    {request.status === "resolved" ? "Resuelto" : "Nuevo"}
                  </span>
                  {request.status !== "resolved" && (
                    <button
                      onClick={() => void adminInboxService.markContactResolved(request.id).then(load)}
                      className="rounded bg-neutral-800 px-2 py-1"
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
        <h2 className="text-xl font-semibold">Alertas WhatsApp por producto</h2>
        {loading ? (
          <p className="mt-3 text-neutral-300">Cargando...</p>
        ) : whatsAppLeads.length === 0 ? (
          <p className="mt-3 text-neutral-400">No hay alertas aun.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {whatsAppLeads.map((lead) => (
              <article key={lead.id} className="rounded border border-neutral-800 bg-neutral-900 p-3 text-sm">
                <p className="font-semibold">{lead.product_name}</p>
                <p className="text-xs text-neutral-400">{formatDate(lead.created_at)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
