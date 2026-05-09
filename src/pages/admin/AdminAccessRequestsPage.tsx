import { useEffect, useState } from "react";
import { adminAccessService } from "@/services/adminAccessService";
import type { AdminAccessRequest } from "@/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

const txt = {
  primary: "text-[#1f1f1d]",
  secondary: "text-[#4f4f4b]",
  muted: "text-[#6a6a66]"
} as const;

export default function AdminAccessRequestsPage() {
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load(): Promise<void> {
    const rows = await adminAccessService.listRequests();
    setRequests(rows);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function review(id: string, approve: boolean): Promise<void> {
    setProcessingId(id);
    try {
      await adminAccessService.reviewRequest(id, approve);
      await load();
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section>
      <h1 className={`text-2xl font-semibold ${txt.primary}`}>Solicitudes de admin</h1>
      <p className={`mt-2 text-sm ${txt.secondary}`}>Solo admins existentes pueden aprobar o denegar nuevos administradores.</p>

      {loading ? (
        <p className={`mt-4 text-sm ${txt.muted}`}>Cargando...</p>
      ) : requests.length === 0 ? (
        <p className={`mt-4 text-sm ${txt.muted}`}>No hay solicitudes.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`font-semibold ${txt.primary}`}>{request.email}</p>
                <p className={`text-xs ${txt.muted}`}>{formatDate(request.created_at)}</p>
              </div>
              {request.full_name && <p className={`mt-1 text-sm ${txt.secondary}`}>{request.full_name}</p>}
              <p className={`mt-1 text-xs ${txt.muted}`}>Estado: {request.status}</p>
              {request.status === "pending" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={processingId === request.id}
                    onClick={() => void review(request.id, true)}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    disabled={processingId === request.id}
                    onClick={() => void review(request.id, false)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    Denegar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
