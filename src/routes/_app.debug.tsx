import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle, Database, Shield, Wifi, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";

export const Route = createFileRoute("/_app/debug")({
  head: () => ({ meta: [{ title: "Debug — PromoJá" }, { name: "robots", content: "noindex" }] }),
  component: DebugPage,
});

type CheckStatus = "idle" | "running" | "ok" | "fail";
type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  detail?: string;
  ms?: number;
};

const INITIAL: Check[] = [
  { id: "auth", label: "Sessão de autenticação", status: "idle" },
  { id: "profile", label: "Perfil do usuário carregado", status: "idle" },
  { id: "approval", label: "Status de aprovação", status: "idle" },
  { id: "roles", label: "Papéis (roles) do usuário", status: "idle" },
  { id: "categorias", label: "Leitura de categorias", status: "idle" },
  { id: "lojas", label: "Leitura de lojas", status: "idle" },
  { id: "cupons", label: "Leitura de cupons", status: "idle" },
  { id: "favoritos", label: "Leitura de favoritos", status: "idle" },
  { id: "solicitacoes", label: "Leitura de solicitações", status: "idle" },
  { id: "notificacoes", label: "Leitura de notificações", status: "idle" },
  { id: "realtime", label: "Conexão realtime", status: "idle" },
  { id: "storage", label: "Acesso ao storage (lojas)", status: "idle" },
];

function DebugPage() {
  const { user, profile, isAdmin } = useAuth();
  const [checks, setChecks] = useState<Check[]>(INITIAL);
  const [running, setRunning] = useState(false);
  const [extra, setExtra] = useState<Record<string, any>>({});

  const setCheck = (id: string, patch: Partial<Check>) =>
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const runAll = async () => {
    setRunning(true);
    setChecks(INITIAL.map((c) => ({ ...c, status: "running" as CheckStatus })));
    const newExtra: Record<string, any> = {};

    const time = async <T,>(id: string, fn: () => Promise<T>): Promise<T | null> => {
      const t0 = performance.now();
      try {
        const r = await fn();
        setCheck(id, { status: "ok", ms: Math.round(performance.now() - t0) });
        return r;
      } catch (e: any) {
        setCheck(id, { status: "fail", detail: e?.message ?? String(e), ms: Math.round(performance.now() - t0) });
        return null;
      }
    };

    // 1. Auth
    await time("auth", async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("Sem sessão ativa");
      newExtra.session_email = data.session.user.email;
      newExtra.session_expires = new Date(data.session.expires_at! * 1000).toLocaleString("pt-BR");
    });

    // 2. Profile
    await time("profile", async () => {
      if (!user) throw new Error("Sem user");
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Perfil não encontrado");
      newExtra.profile_nome = data.nome;
    });

    // 3. Approval
    await time("approval", async () => {
      if (!profile) throw new Error("Sem profile");
      if (profile.approval_status !== "aprovado") throw new Error(`Status: ${profile.approval_status}`);
    });

    // 4. Roles
    await time("roles", async () => {
      if (!user) throw new Error("Sem user");
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (error) throw error;
      newExtra.roles = data?.map((r) => r.role).join(", ") || "nenhum";
    });

    // 5. Categorias
    await time("categorias", async () => {
      const { data, error, count } = await supabase
        .from("categorias")
        .select("*", { count: "exact", head: false })
        .limit(5);
      if (error) throw error;
      newExtra.categorias_count = count ?? data?.length ?? 0;
    });

    // 6. Lojas
    await time("lojas", async () => {
      const { data, error, count } = await supabase
        .from("lojas")
        .select("*", { count: "exact", head: false })
        .limit(5);
      if (error) throw error;
      newExtra.lojas_count = count ?? data?.length ?? 0;
    });

    // 7. Cupons
    await time("cupons", async () => {
      const { data, error, count } = await supabase
        .from("cupons")
        .select("*", { count: "exact", head: false })
        .limit(5);
      if (error) throw error;
      newExtra.cupons_count = count ?? data?.length ?? 0;
    });

    // 8. Favoritos
    await time("favoritos", async () => {
      if (!user) throw new Error("Sem user");
      const { error, count } = await supabase
        .from("favoritos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      newExtra.favoritos_count = count ?? 0;
    });

    // 9. Solicitações
    await time("solicitacoes", async () => {
      if (!user) throw new Error("Sem user");
      const { error, count } = await supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      newExtra.solicitacoes_count = count ?? 0;
    });

    // 10. Notificações
    await time("notificacoes", async () => {
      if (!user) throw new Error("Sem user");
      const { error, count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (error) throw error;
      newExtra.notificacoes_count = count ?? 0;
    });

    // 11. Realtime
    await time("realtime", async () => {
      return new Promise<void>((resolve, reject) => {
        const ch = supabase.channel(`debug-${Date.now()}`);
        const timeout = setTimeout(() => {
          ch.unsubscribe();
          reject(new Error("Timeout 5s"));
        }, 5000);
        ch.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            ch.unsubscribe();
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            ch.unsubscribe();
            reject(new Error(status));
          }
        });
      });
    });

    // 12. Storage
    await time("storage", async () => {
      const { data, error } = await supabase.storage.from("lojas").list("", { limit: 1 });
      if (error) throw error;
      newExtra.storage_files = data?.length ?? 0;
    });

    setExtra(newExtra);
    setRunning(false);
  };

  useEffect(() => {
    if (user && profile) runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = checks.length;
  const okCount = checks.filter((c) => c.status === "ok").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const score = total ? Math.round((okCount / total) * 100) : 0;

  return (
    <>
      <ScreenHeader title="Diagnóstico do sistema" subtitle="Verifica todas as conexões e permissões" />
      <Scroll>
        <div className="px-4 py-4 space-y-4">
          {/* Resumo */}
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                failCount > 0 ? "bg-destructive/15 text-destructive" : okCount === total ? "bg-emerald-500/15 text-emerald-500" : "bg-primary/15 text-primary"
              }`}>
                {running ? <Loader2 size={24} className="animate-spin" /> : failCount > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-display font-bold">{score}%</div>
                <div className="text-xs text-muted-foreground">
                  {okCount} OK · {failCount} falhas · {total} testes
                </div>
              </div>
              <button
                onClick={runAll}
                disabled={running}
                className="flex h-10 items-center gap-2 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow press disabled:opacity-50"
              >
                <RefreshCw size={16} className={running ? "animate-spin" : ""} />
                Rodar
              </button>
            </div>
          </div>

          {/* Info do usuário */}
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <UserIcon size={16} className="text-primary" /> Usuário atual
            </div>
            <div className="space-y-1.5 text-xs">
              <Row k="ID" v={user?.id?.slice(0, 8) + "…"} />
              <Row k="E-mail" v={user?.email ?? "—"} />
              <Row k="Nome" v={profile?.nome ?? "—"} />
              <Row k="Status" v={profile?.approval_status ?? "—"} />
              <Row k="Admin" v={isAdmin ? "sim" : "não"} />
              {extra.roles && <Row k="Papéis" v={extra.roles} />}
              {extra.session_expires && <Row k="Sessão expira" v={extra.session_expires} />}
            </div>
          </div>

          {/* Checks */}
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Shield size={16} className="text-primary" /> Testes de conectividade
            </div>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
                  <StatusIcon status={c.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.label}</div>
                    {c.detail && <div className="text-[11px] text-destructive truncate">{c.detail}</div>}
                  </div>
                  {c.ms !== undefined && (
                    <div className="text-[11px] tabular-nums text-muted-foreground">{c.ms}ms</div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Estatísticas */}
          {Object.keys(extra).length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Database size={16} className="text-primary" /> Dados no sistema
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {extra.categorias_count !== undefined && <Stat label="Categorias" value={extra.categorias_count} />}
                {extra.lojas_count !== undefined && <Stat label="Lojas" value={extra.lojas_count} />}
                {extra.cupons_count !== undefined && <Stat label="Cupons" value={extra.cupons_count} />}
                {extra.favoritos_count !== undefined && <Stat label="Meus favoritos" value={extra.favoritos_count} />}
                {extra.solicitacoes_count !== undefined && <Stat label="Minhas solicitações" value={extra.solicitacoes_count} />}
                {extra.notificacoes_count !== undefined && <Stat label="Notificações" value={extra.notificacoes_count} />}
              </div>
            </div>
          )}

          {/* Ambiente */}
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Wifi size={16} className="text-primary" /> Ambiente
            </div>
            <div className="space-y-1.5 text-xs">
              <Row k="URL" v={typeof window !== "undefined" ? window.location.host : "—"} />
              <Row k="User-Agent" v={typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 40) + "…" : "—"} />
              <Row k="Online" v={typeof navigator !== "undefined" ? (navigator.onLine ? "sim" : "não") : "—"} />
              <Row k="Idioma" v={typeof navigator !== "undefined" ? navigator.language : "—"} />
            </div>
          </div>

          <Link
            to="/home"
            className="block rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold press"
          >
            Voltar para a Home
          </Link>
          <div className="h-6" />
        </div>
      </Scroll>
    </>
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "running") return <Loader2 size={18} className="animate-spin text-primary shrink-0" />;
  if (status === "ok") return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
  if (status === "fail") return <XCircle size={18} className="text-destructive shrink-0" />;
  return <div className="h-[18px] w-[18px] rounded-full border border-border shrink-0" />;
}

function Row({ k, v }: { k: string; v: string | undefined }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium truncate max-w-[60%] text-right">{v ?? "—"}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-display font-bold">{value}</div>
    </div>
  );
}
