import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ApprovalStatus = "pendente" | "aprovado" | "negado";

export type Profile = {
  id: string;
  email: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  avatar_url: string | null;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
  created_at: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isAdmin = !!roles?.some((r) => r.role === "admin");
  return { profile: (profile as Profile | null) ?? null, isAdmin };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const hydrate = async (sess: Session | null) => {
    setSession(sess);
    setUser(sess?.user ?? null);
    if (sess?.user) {
      const { profile, isAdmin } = await loadProfile(sess.user.id);
      setProfile(profile);
      setIsAdmin(isAdmin);
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      // Defer profile load to avoid deadlock
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => {
          loadProfile(sess.user.id).then(({ profile, isAdmin }) => {
            setProfile(profile);
            setIsAdmin(isAdmin);
          });
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => hydrate(session));

    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    if (!user) return;
    const { profile, isAdmin } = await loadProfile(user.id);
    setProfile(profile);
    setIsAdmin(isAdmin);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isAdmin, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
