import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { type PfStatus } from "@/lib/labels";

export const Route = createFileRoute("/_authenticated/approvals")({ component: ApprovalsPage });

function ApprovalsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging_formats")
        .select(
          "id, packaging_code, version, status, products(product_name), customers(customer_name)",
        )
        .eq("status", "pending")
        .order("packaging_code");
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHeader title="คิวอนุมัติ" description="รายการรออนุมัติจาก localStorage" />
      <div className="panel space-y-2 p-4">
        {isLoading && <p className="text-sm text-muted-foreground">กำลังโหลด...</p>}
        {data.map((format) => (
          <Link
            key={format.id}
            to="/packaging/$id"
            params={{ id: format.id }}
            className="flex items-center justify-between rounded-md border px-4 py-3 text-sm hover:bg-muted/50"
          >
            <span>
              {format.packaging_code} v{format.version} · {format.products?.product_name} ·{" "}
              {format.customers?.customer_name}
            </span>
            <StatusBadge status={format.status as PfStatus} />
          </Link>
        ))}
        {!isLoading && data.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">ไม่มีรายการรออนุมัติ</p>
        )}
      </div>
    </>
  );
}
