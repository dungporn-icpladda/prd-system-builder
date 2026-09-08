import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, ClipboardCheck, GitBranch, Package, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ระบบรูปแบบผลิตภัณฑ์ของการบรรจุสินค้า" },
      {
        name: "description",
        content:
          "จัดเก็บ ค้นหา อนุมัติ และควบคุมเวอร์ชันรูปแบบการบรรจุสินค้าของลูกค้าแต่ละราย ในระบบเดียว",
      },
      { property: "og:title", content: "ระบบรูปแบบผลิตภัณฑ์ของการบรรจุสินค้า" },
      {
        property: "og:description",
        content: "มาตรฐานเดียวกันทั้งฝ่ายขาย ฝ่ายผลิต คลังสินค้า และ QC",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Boxes, title: "ข้อมูลลูกค้าและสินค้า", desc: "จัดเก็บลูกค้า สินค้า และรหัส SKU ไว้ที่เดียว" },
  { icon: Package, title: "รูปแบบการบรรจุครบถ้วน", desc: "จำนวนต่อแพ็ก น้ำหนัก ขนาด วัสดุ ฉลาก บาร์โค้ด" },
  { icon: ClipboardCheck, title: "ขั้นตอนการอนุมัติ", desc: "ฉบับร่าง รออนุมัติ อนุมัติ ไม่อนุมัติ จัดเก็บ" },
  { icon: GitBranch, title: "ควบคุมเวอร์ชัน", desc: "ข้อมูลที่อนุมัติแล้วแก้ไขไม่ได้ ต้องสร้างเวอร์ชันใหม่" },
  { icon: Search, title: "ค้นหาและกรองรวดเร็ว", desc: "กรองตามลูกค้า สถานะ ประเภทบรรจุภัณฑ์ และวันที่" },
  { icon: ShieldCheck, title: "สิทธิ์ตามบทบาท", desc: "แยกสิทธิ์ฝ่ายขาย ผลิตภัณฑ์ QC ผลิต คลัง และผู้อนุมัติ" },
];

function Landing() {
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold">ระบบรูปแบบการบรรจุสินค้า</span>
          <Button asChild size="sm">
            <Link to={user ? "/dashboard" : "/auth"}>{user ? "เข้าสู่ระบบงาน" : "เข้าสู่ระบบ"}</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <p className="text-sm font-medium text-primary">Packaging Format Management</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-snug md:text-5xl">
          รูปแบบผลิตภัณฑ์ของการบรรจุสินค้า มาตรฐานเดียวกันทั้งองค์กร
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          เลิกตามหาข้อมูลจาก Excel แชต และอีเมล รวมทุกรูปแบบการบรรจุของลูกค้าไว้ที่เดียว
          พร้อมไฟล์แนบ ประวัติการแก้ไข และการอนุมัติที่ตรวจสอบย้อนหลังได้
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={user ? "/dashboard" : "/auth"}>เริ่มใช้งาน</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/packaging">ดูรูปแบบการบรรจุ</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border p-5">
              <f.icon className="size-6 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        ระบบรูปแบบผลิตภัณฑ์ของการบรรจุสินค้า · เวอร์ชัน 1.0
      </footer>
    </div>
  );
}
