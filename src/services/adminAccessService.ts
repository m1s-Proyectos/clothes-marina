import { supabase } from "@/lib/supabase";
import type { AdminAccessRequest } from "@/types";

interface RequestAdminAccessPayload {
  userId: string;
  email: string;
  fullName?: string;
}

export const adminAccessService = {
  async requestAccess(payload: RequestAdminAccessPayload): Promise<void> {
    const { error } = await supabase.from("admin_access_requests").upsert(
      {
        user_id: payload.userId,
        email: payload.email,
        full_name: payload.fullName ?? null,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  },

  async listRequests(): Promise<AdminAccessRequest[]> {
    const { data, error } = await supabase
      .from("admin_access_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AdminAccessRequest[];
  },

  async reviewRequest(id: string, approve: boolean, notes?: string): Promise<void> {
    const { error } = await supabase.rpc("review_admin_access_request", {
      p_request_id: id,
      p_approve: approve,
      p_notes: notes ?? null
    });
    if (error) throw error;
  }
};
