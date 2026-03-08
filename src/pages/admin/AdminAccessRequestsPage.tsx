import { useEffect, useState } from "react";
import { adminAccessService } from "@/services/adminAccessService";
import type { AdminAccessRequest } from "@/types";

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

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
      <h1 className="text-2xl font-semibold">Solicitudes de Admin</h1>
      <p className="mt-2 text-neutral-300">Solo admins existentes pueden aprobar o denegar nuevos administradores.</p>

      {loading ? (
        <p className="mt-4 text-neutral-300">Cargando...</p>
      ) : requests.length === 0 ? (
        <p className="mt-4 text-neutral-400">No hay solicitudes.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{request.email}</p>
                <p className="text-xs text-neutral-400">{formatDate(request.created_at)}</p>
              </div>
              {request.full_name && <p className="mt-1 text-sm text-neutral-300">{request.full_name}</p>}
              <p className="mt-1 text-xs text-neutral-400">Estado: {request.status}</p>
              {request.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={processingId === request.id}
                    onClick={() => void review(request.id, true)}
                    className="rounded bg-emerald-700 px-3 py-1 text-sm disabled:opacity-60"
                  >
                    Aprobar
                  </button>
                  <button
                    disabled={processingId === request.id}
                    onClick={() => void review(request.id, false)}
                    className="rounded bg-red-700 px-3 py-1 text-sm disabled:opacity-60"
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
