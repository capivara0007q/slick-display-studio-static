import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Camera, Keyboard, LogOut, Loader2, CheckCircle2, XCircle, Search,
  Store as StoreIcon, Ticket, User, Calendar, AlertTriangle, RotateCcw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/Toast";
import { formatDateTimeBR } from "@/lib/format";
import logoPromoja from "@/assets/logo-promoja.png";

export const Route = createFileRoute("/lojista/")({
  head: () => ({
    meta: [
      { title: "Validador — PromoJá" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LojistaPage,
});

type Loja = { id: string; nome: string; foto_url: string | null };
type LookupResult =
  | { ok: true; sol: any; cupom: any; loja: any; cliente: any; }
  | { ok: false; reason: string };

function LojistaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaAtiva, setLojaAtiva] = useState<Loja | null>(null);
  const [mode, setMode] = useState<"camera" | "manual">("manual");
  const [codigo, setCodigo] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [confirming, setConfirming] = useState(false);

  // ============ AUTH + lojas ============
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/lojista/login", replace: true });
        return;
      }
      setUserEmail(user.email ?? "");
      const { data: vinculos } = await supabase
        .from("loja_usuarios")
        .select("loja_id, lojas:loja_id ( id, nome, foto_url )")
        .eq("user_id", user.id);

      const ls: Loja[] = (vinculos ?? [])
        .map((v: any) => v.lojas)
        .filter(Boolean);
      if (ls.length === 0) {
        await supabase.auth.signOut();
        navigate({ to: "/lojista/login", replace: true });
        return;
      }
      setLojas(ls);
      const stored = localStorage.getItem("lojista_loja_id");
      const found = stored ? ls.find((l) => l.id === stored) : null;
      setLojaAtiva(found ?? ls[0]);
      setLoadingAuth(false);
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("lojista_loja_id");
    navigate({ to: "/lojista/login", replace: true });
  };

  const switchLoja = (l: Loja) => {
    setLojaAtiva(l);
    localStorage.setItem("lojista_loja_id", l.id);
    setResult(null);
  };

  // ============ Lookup ============
  const lookup = async (codeRaw: string) => {
    if (!lojaAtiva) return;
    const code = codeRaw.trim().toUpperCase();
    if (code.length < 4) {
      toast.push({ kind: "error", title: "Código inválido", message: "Digite o código completo." });
      return;
    }
    setBusy(true);
    setResult(null);
    const { data: sol, error } = await supabase
      .from("solicitacoes")
      .select("*")
      .eq("codigo", code)
      .maybeSingle();
    if (error || !sol) {
      setBusy(false);
      setResult({ ok: false, reason: "Código não encontrado." });
      return;
    }
    const { data: cupom } = await supabase.from("cupons").select("*").eq("id", sol.cupom_id).maybeSingle();
    if (!cupom) {
      setBusy(false);
      setResult({ ok: false, reason: "Cupom não encontrado." });
      return;
    }
    if (cupom.loja_id !== lojaAtiva.id) {
      setBusy(false);
      setResult({ ok: false, reason: "Este cupom pertence a outra loja." });
      return;
    }
    const { data: loja } = await supabase.from("lojas").select("*").eq("id", cupom.loja_id).maybeSingle();
    const { data: cliente } = await supabase.from("profiles").select("nome, email, avatar_url").eq("id", sol.user_id).maybeSingle();
    setBusy(false);
    setResult({ ok: true, sol, cupom, loja, cliente });
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(codigo);
  };

  const confirmarUso = async () => {
    if (!result || !result.ok) return;
    setConfirming(true);
    const { error } = await supabase
      .from("solicitacoes")
      .update({ status: "usada", used_at: new Date().toISOString() })
      .eq("id", result.sol.id);
    setConfirming(false);
    if (error) {
      toast.push({ kind: "error", title: "Falha ao validar", message: error.message });
      return;
    }
    toast.push({ kind: "success", title: "Cupom validado!", message: "Cliente recebeu o desconto." });
    setResult(null);
    setCodigo("");
  };

  const cancelar = () => {
    setResult(null);
    setCodigo("");
  };

  // ============ Render ============
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logoPromoja} alt="" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-glow">Portal do Lojista</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{userEmail}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="press inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground ring-1 ring-border">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        {/* SELETOR DE LOJA */}
        {lojas.length > 1 ? (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Validando para</p>
            <div className="flex flex-wrap gap-2">
              {lojas.map((l) => (
                <button
                  key={l.id}
                  onClick={() => switchLoja(l)}
                  className={
                    "press inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition " +
                    (lojaAtiva?.id === l.id
                      ? "bg-gradient-primary text-primary-foreground ring-primary shadow-glow"
                      : "bg-surface-2 text-foreground ring-border")
                  }
                >
                  <StoreIcon size={14} />
                  {l.nome}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-surface ring-1 ring-border p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <StoreIcon className="text-primary-foreground" size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Validando para</p>
              <p className="text-base font-bold text-foreground">{lojaAtiva?.nome}</p>
            </div>
          </div>
        )}

        {/* RESULTADO ou TABS */}
        {result ? (
          <ResultCard
            result={result}
            confirming={confirming}
            onConfirm={confirmarUso}
            onCancel={cancelar}
          />
        ) : (
          <>
            {/* Tabs camera/manual */}
            <div className="flex rounded-xl bg-surface-2 p-1 ring-1 ring-border">
              <button
                onClick={() => setMode("manual")}
                className={
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition " +
                  (mode === "manual" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-foreground")
                }
              >
                <Keyboard size={16} className="inline mr-1.5" />
                Digitar código
              </button>
              <button
                onClick={() => setMode("camera")}
                className={
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition " +
                  (mode === "camera" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-foreground")
                }
              >
                <Camera size={16} className="inline mr-1.5" />
                Ler QR Code
              </button>
            </div>

            {mode === "manual" ? (
              <form onSubmit={onManualSubmit} className="rounded-3xl bg-surface ring-1 ring-border p-5 shadow-elev">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Código do cupom</span>
                  <input
                    autoFocus
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="EX: A1B2C3D4E5"
                    maxLength={20}
                    className="mt-2 w-full rounded-xl bg-surface-2 px-4 py-4 font-display text-2xl tracking-[0.2em] text-foreground ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
                <button
                  type="submit" disabled={busy || !codigo}
                  className="press mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-glow disabled:opacity-70"
                >
                  {busy ? <Loader2 className="animate-spin" size={18} /> : <><Search size={16} /> Buscar cupom</>}
                </button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Peça pro cliente abrir o cupom no app e ditar o código.
                </p>
              </form>
            ) : (
              <QRScanner onCode={lookup} busy={busy} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ============================== QR SCANNER ==============================
function QRScanner({ onCode, busy }: { onCode: (code: string) => void; busy: boolean }) {
  const containerId = "qr-reader";
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let stopped = false;
    let lastCode = "";
    let lastAt = 0;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (stopped) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            const now = Date.now();
            // debounce: ignora repetições por 2s
            if (decoded === lastCode && now - lastAt < 2000) return;
            lastCode = decoded;
            lastAt = now;
            onCode(decoded);
          },
          () => {/* ignore frame errors */}
        );
        setStarting(false);
      } catch (e: any) {
        setError(e?.message ?? "Não foi possível acessar a câmera.");
        setStarting(false);
      }
    })();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onCode]);

  return (
    <div className="rounded-3xl bg-surface ring-1 ring-border p-3 shadow-elev">
      <div id={containerId} className="overflow-hidden rounded-2xl bg-black aspect-square" />
      {starting && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Loader2 className="inline animate-spin mr-1" size={12} /> Abrindo câmera...
        </p>
      )}
      {error && (
        <div className="mt-3 rounded-xl bg-destructive/15 p-3 text-xs text-destructive ring-1 ring-destructive/30">
          <AlertTriangle className="inline mr-1" size={14} />
          {error} — Use a aba "Digitar código".
        </div>
      )}
      {busy && (
        <p className="mt-3 text-center text-xs text-primary-glow">
          <Loader2 className="inline animate-spin mr-1" size={12} /> Validando...
        </p>
      )}
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Aponte a câmera para o QR Code do cliente.
      </p>
    </div>
  );
}

// ============================== RESULTADO ==============================
function ResultCard({
  result, confirming, onConfirm, onCancel,
}: {
  result: LookupResult; confirming: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  if (!result.ok) {
    return (
      <div className="rounded-3xl bg-surface ring-1 ring-destructive/40 p-6 text-center shadow-elev">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15">
          <XCircle className="text-destructive" size={36} />
        </div>
        <h2 className="mt-4 font-display text-xl font-black text-foreground">Cupom inválido</h2>
        <p className="mt-2 text-sm text-muted-foreground">{result.reason}</p>
        <button onClick={onCancel} className="press mt-5 inline-flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border">
          <RotateCcw size={14} /> Tentar outro
        </button>
      </div>
    );
  }

  const { sol, cupom, cliente } = result;
  const status = sol.status as string;
  const jaUsado = status === "usada";
  const negado = status === "negada";
  const pendente = status === "pendente";
  const aprovado = status === "aprovada";

  let badge = { bg: "bg-success/15", text: "text-success", label: "Pronto para usar", Icon: CheckCircle2 };
  if (jaUsado) badge = { bg: "bg-muted-foreground/15", text: "text-muted-foreground", label: "Já utilizado", Icon: XCircle };
  else if (negado) badge = { bg: "bg-destructive/15", text: "text-destructive", label: "Recusado pelo admin", Icon: XCircle };
  else if (pendente) badge = { bg: "bg-warning/15", text: "text-warning", label: "Aguardando aprovação", Icon: AlertTriangle };

  const podeValidar = aprovado;

  return (
    <div className="rounded-3xl bg-gradient-card ring-1 ring-border p-6 shadow-elev">
      <div className={"mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold " + badge.bg + " " + badge.text}>
        <badge.Icon size={14} /> {badge.label}
      </div>

      <h2 className="mt-4 font-display text-2xl font-black text-foreground">{cupom.titulo}</h2>
      <span className="inline-block mt-2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-extrabold text-primary-foreground shadow-glow">
        {cupom.desconto}
      </span>

      <div className="mt-5 space-y-3 rounded-2xl bg-surface-2 p-4 text-left ring-1 ring-border">
        <div className="flex items-center gap-3">
          {cliente?.avatar_url ? (
            <img src={cliente.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-border">
              <User size={18} className="text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cliente</p>
            <p className="truncate text-sm font-bold text-foreground">{cliente?.nome ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-border">
            <Ticket size={18} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Código</p>
            <p className="font-display text-base font-black tracking-widest text-foreground">{sol.codigo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-border">
            <Calendar size={18} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {jaUsado ? "Utilizado em" : "Solicitado em"}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatDateTimeBR(jaUsado && sol.used_at ? sol.used_at : sol.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onCancel}
          className="press flex-1 rounded-xl bg-surface-2 px-4 py-3 text-sm font-bold text-foreground ring-1 ring-border"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!podeValidar || confirming}
          className="press flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          {podeValidar ? "Usar agora" : "Não pode usar"}
        </button>
      </div>

      {!podeValidar && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {jaUsado ? "Este cupom já foi utilizado anteriormente." :
           pendente ? "O cliente precisa aguardar aprovação do admin." :
           "Cupom não está disponível para uso."}
        </p>
      )}
    </div>
  );
}
