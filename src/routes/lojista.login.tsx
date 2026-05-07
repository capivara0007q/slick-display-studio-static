import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/Toast";
import logoPromoja from "@/assets/logo-promoja.png";

export const Route = createFileRoute("/lojista/login")({
  head: () => ({
    meta: [
      { title: "Validador do Lojista — PromoJá" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LojistaLoginPage,
});

function LojistaLoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: signIn, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !signIn.user) {
      setLoading(false);
      toast.push({ kind: "error", title: "Não foi possível entrar", message: error?.message ?? "" });
      return;
    }
    // Verificar se é lojista
    const { data: vinculos } = await supabase
      .from("loja_usuarios")
      .select("loja_id")
      .eq("user_id", signIn.user.id);
    setLoading(false);
    if (!vinculos || vinculos.length === 0) {
      await supabase.auth.signOut();
      toast.push({
        kind: "error",
        title: "Acesso negado",
        message: "Esta conta não está vinculada a nenhuma loja. Procure o administrador.",
      });
      return;
    }
    toast.push({ kind: "success", title: "Bem-vindo!" });
    navigate({ to: "/lojista" });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-hero flex items-center justify-center p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <img src={logoPromoja} alt="PromoJá" className="h-24 w-24 object-contain drop-shadow-[0_0_30px_rgba(255,90,30,0.4)]" />
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-glow ring-1 ring-primary/30">
            <Store size={12} />
            Portal do Lojista
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Valide cupons dos seus clientes</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 rounded-3xl glass p-6 shadow-elev">
          <h2 className="text-lg font-bold text-foreground">Acessar validador</h2>
          <p className="mt-1 text-xs text-muted-foreground">Use o e-mail cadastrado pelo administrador.</p>

          <label className="mt-6 block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">E-mail</span>
            <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
              <Mail size={18} className="text-muted-foreground" />
              <input
                type="email" inputMode="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="loja@exemplo.com"
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Senha</span>
            <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
              <Lock size={18} className="text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"} autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="press p-1 text-muted-foreground" aria-label="Mostrar senha">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="submit" disabled={loading}
            className="press mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-glow disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar como lojista"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Não é lojista? Acesse o app pelo <a href="/login" className="font-bold text-primary-glow">login normal</a>.
        </p>
      </div>
    </div>
  );
}
