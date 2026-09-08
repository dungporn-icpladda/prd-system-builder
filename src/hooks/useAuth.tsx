import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/labels";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useMyRoles() {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });

  const roles = query.data ?? [];
  const has = (...r: AppRole[]) => r.some((x) => roles.includes(x));

  return {
    roles,
    loading: query.isLoading,
    isAdmin: roles.includes("admin"),
    canEditCustomers: has("admin", "sales"),
    canEditProducts: has("admin", "sales", "product"),
    canEditPackaging: has("admin", "sales", "product"),
    canApprove: has("admin", "manager"),
    canArchive: has("admin", "manager"),
  };
}
