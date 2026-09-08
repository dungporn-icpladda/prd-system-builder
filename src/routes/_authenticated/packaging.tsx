import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { formatDateTime, type PfStatus } from "@/lib/labels";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/packaging")({
  component: PackagingPage,
});

function PackagingPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["packaging-formats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging_formats")
        .select(
          "id, packaging_code, version, status, updated_at, products(product_name), customers(customer_name)",
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHeader title="รูปแบบการบรรจุ" description="รายการรูปแบบการบรรจุจาก localStorage" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">กำลังโหลด...</p>}
          {data.map((format) => (
            <Link
              key={format.id}
              to="/packaging/$id"
              params={{ id: format.id }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3 text-sm hover:bg-muted/50"
            >
              <div>
                <span className="font-medium">{format.packaging_code}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · v{format.version} · {format.products?.product_name}
                </span>
                <p className="text-xs text-muted-foreground">{format.customers?.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(format.updated_at)}
                </span>
                <StatusBadge status={format.status as PfStatus} />
              </div>
            </Link>
          ))}
          {!isLoading && data.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
