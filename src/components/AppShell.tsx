import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  ClipboardCheck,
  Factory,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles, useSession } from "@/hooks/useAuth";
import { ROLE_LABEL } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { to: "/customers", label: "ลูกค้า", icon: Users },
  { to: "/products", label: "สินค้า", icon: Boxes },
  { to: "/packaging", label: "รูปแบบการบรรจุ", icon: Package },
  { to: "/approvals", label: "คิวอนุมัติ", icon: ClipboardCheck },
  { to: "/audit", label: "ประวัติการใช้งาน", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { roles, isAdmin } = useMyRoles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = isAdmin
    ? [...NAV, { to: "/users", label: "ผู้ใช้งานและสิทธิ์", icon: ShieldCheck } as const]
    : NAV;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[18px_0_40px_rgb(120_53_15_/_0.1)] transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <div className="rounded-2xl bg-sidebar-primary p-2 text-sidebar-primary-foreground shadow-[0_14px_32px_rgb(120_53_15_/_0.2)]">
            <Factory className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-wide">ระบบรูปแบบการบรรจุ</p>
            <p className="text-xs font-semibold text-sidebar-foreground/70">
              ShopVibe Design System
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-full px-3 py-2 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_32px_rgb(120_53_15_/_0.2)]"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_10px_24px_rgb(120_53_15_/_0.1)]",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4 text-xs">
          <p className="truncate font-medium">{user?.email}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {roles.map((r) => (
              <Badge key={r} variant="secondary" className="text-[10px]">
                {ROLE_LABEL[r]}
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start gap-2"
            onClick={signOut}
          >
            <LogOut className="size-4" /> ออกจากระบบ
          </Button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="เปิดเมนู">
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-semibold">ระบบรูปแบบการบรรจุ</span>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function ShopVibeLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center", compact ? "gap-1" : "gap-3")}>
      <div className={cn("shopvibe-logo", compact && "scale-75")}>
        <div className="shopvibe-logo-mark">
          <span className="shopvibe-logo-text">SHOP</span>
          <span className="shopvibe-logo-seven">V</span>
        </div>
      </div>
      {!compact && <div className="shopvibe-ribbon">SHOPVIBE SYSTEM</div>}
    </div>
  );
}

export const Flip7Logo = ShopVibeLogo;

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
