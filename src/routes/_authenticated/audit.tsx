import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { ACTION_LABEL, formatDateTime } from "@/lib/labels";

export const Route = createFileRoute("/_authenticated/audit")({ component: AuditPage });

function AuditPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("action_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHeader title="ประวัติการใช้งาน" description="บันทึกการเปลี่ยนแปลงจาก localStorage" />
      <div className="panel divide-y">
        {isLoading && <p className="p-4 text-sm text-muted-foreground">กำลังโหลด...</p>}
        {data.map((log) => (
          <div key={log.id} className="p-4 text-sm">
            <p className="font-medium">
              {ACTION_LABEL[log.action] ?? log.action} {log.entity_type}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(log.action_at)}</p>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">ยังไม่มีประวัติ</p>
        )}
      </div>
    </>
  );
}
