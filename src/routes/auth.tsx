import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShopVibeLogo } from "@/components/AppShell";
import { localStorageCredentials, supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ | ระบบรูปแบบการบรรจุสินค้า" },
      { name: "description", content: "เข้าสู่ระบบเพื่อจัดการรูปแบบการบรรจุสินค้าของลูกค้า" },
      { property: "og:title", content: "เข้าสู่ระบบ | ระบบรูปแบบการบรรจุสินค้า" },
      {
        property: "og:description",
        content: "เข้าสู่ระบบเพื่อจัดการรูปแบบการบรรจุสินค้าของลูกค้า",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ", { description: error.message });
      return;
    }
    toast.success("ยินดีต้อนรับกลับ");
    navigate({ to: "/dashboard", replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("สมัครใช้งานไม่สำเร็จ", { description: error.message });
      return;
    }
    if (!data.session) {
      toast.error("สมัครใช้งานไม่สำเร็จ");
      return;
    }
    toast.success("สมัครสำเร็จ");
    navigate({ to: "/dashboard", replace: true });
  }

  async function demoLogin() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: localStorageCredentials.demoEmail,
      password: localStorageCredentials.demoPassword,
    });
    setBusy(false);
    if (error) {
      toast.error("เข้าใช้งานแบบ Local Demo ไม่สำเร็จ", { description: error.message });
      return;
    }
    toast.success("เข้าใช้งานแบบ Local Demo");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md panel p-8 shadow-[0_18px_42px_rgb(217_70_239_/_0.16),0_8px_28px_rgb(34_211_238_/_0.12)]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <ShopVibeLogo />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-primary">
              ระบบรูปแบบการบรรจุสินค้า
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">สำหรับทีมงานภายในองค์กร</p>
          </div>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
            <TabsTrigger value="signup">สมัครใช้งาน</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form className="space-y-4 pt-4" onSubmit={signIn}>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                เข้าสู่ระบบ
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4 pt-4" onSubmit={signUp}>
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">อีเมล</Label>
                <Input
                  id="email2"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">รหัสผ่าน</Label>
                <Input
                  id="password2"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                สมัครใช้งาน
              </Button>
              <p className="text-xs text-muted-foreground">
                ข้อมูลบัญชีและข้อมูลระบบจะเก็บใน localStorage ของเบราว์เซอร์นี้เท่านั้น
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> หรือ <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={demoLogin} disabled={busy}>
          เข้าใช้งานแบบ Local Demo
        </Button>
      </div>
    </div>
  );
}
