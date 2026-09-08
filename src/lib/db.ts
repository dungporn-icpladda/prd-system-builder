import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  entity_type: string;
  entity_id?: string | null;
  action: string;
  before_value?: unknown;
  after_value?: unknown;
  note?: string | null;
}) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    entity_type: params.entity_type,
    entity_id: params.entity_id ?? null,
    action: params.action,
    before_value: (params.before_value ?? null) as never,
    after_value: (params.after_value ?? null) as never,
    note: params.note ?? null,
    action_by: data.user?.id ?? null,
  });
}

export async function logApproval(params: {
  packaging_format_id: string;
  action: string;
  comment?: string | null;
}) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("approval_logs").insert({
    packaging_format_id: params.packaging_format_id,
    action: params.action,
    comment: params.comment ?? null,
    action_by: data.user?.id ?? null,
  });
}
