import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User as SupaUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "teacher" | "student";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
};

type AuthCtx = {
  user: SupaUser | null;
  session: Session | null;
  profile: Profile | null;
  roles: Role[];
  primaryRole: Role | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const ROLE_PRIORITY: Role[] = ["admin", "teacher", "student"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuxData = async (uid: string) => {
    const [{ data: prof }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as Profile | null) ?? null);
    setRoles(((roleRows ?? []) as { role: Role }[]).map((r) => r.role));
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) {
      await loadAuxData(data.session.user.id);
    } else {
      setProfile(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // Defer to avoid deadlocks
        setTimeout(() => {
          loadAuxData(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    // Then fetch existing session
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadAuxData(data.session.user.id);
      }
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
  };

  const primaryRole = ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;

  return (
    <Ctx.Provider value={{ user, session, profile, roles, primaryRole, loading, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
