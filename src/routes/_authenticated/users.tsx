import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { ROLE_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/users")({ component: UsersPage });

function UsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["users-page"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("email"),
        supabase.from("user_roles").select("*"),
      ]);
      if (profiles.error) throw profiles.error;
      if (roles.error) throw roles.error;
      return { profiles: profiles.data, roles: roles.data };
    },
  });

  return (
    <>
      <PageHeader title="ผู้ใช้งานและสิทธิ์" description="บัญชี localStorage ของเบราว์เซอร์นี้" />
      <div className="panel divide-y">
        {isLoading && <p className="p-4 text-sm text-muted-foreground">กำลังโหลด...</p>}
        {(data?.profiles ?? []).map((profile) => (
          <div
            key={profile.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
          >
            <div>
              <p className="font-medium">{profile.full_name || "-"}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(data?.roles ?? [])
                .filter((role) => role.user_id === profile.id)
                .map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {ROLE_LABEL[role.role]}
                  </Badge>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
