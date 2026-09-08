import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { num, type PfStatus } from "@/lib/labels";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/packaging/$id")({
  component: PackagingDetail,
});

function PackagingDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["packaging", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging_formats")
        .select("*, products(product_name), customers(customer_name)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !data) return <p className="text-muted-foreground">กำลังโหลด...</p>;

  return (
    <>
      <PageHeader
        title={data.packaging_code}
        description={`เวอร์ชัน ${data.version} · ${data.products?.product_name ?? "-"}`}
        action={
          <Button asChild variant="outline">
            <Link to="/packaging">กลับรายการรูปแบบการบรรจุ</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายละเอียด</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Info label="ลูกค้า" value={data.customers?.customer_name} />
          <Info label="สินค้า" value={data.products?.product_name} />
          <Info label="ชนิดบรรจุภัณฑ์" value={data.packaging_type} />
          <div>
            <p className="text-muted-foreground">สถานะ</p>
            <StatusBadge status={data.status as PfStatus} />
          </div>
          <Info label="จำนวนต่อแพ็ก" value={num(data.unit_per_pack)} />
          <Info label="แพ็กต่อลัง" value={num(data.pack_per_carton)} />
          <Info label="น้ำหนักสุทธิ" value={num(data.net_weight)} />
          <Info label="น้ำหนักรวม" value={num(data.gross_weight)} />
          <Info label="วัสดุ" value={data.material} />
          <Info label="ข้อกำหนดฉลาก" value={data.label_requirement} />
          <Info label="บาร์โค้ด" value={data.barcode} />
          <Info label="คำแนะนำพิเศษ" value={data.special_instruction} />
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
