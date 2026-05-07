import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/Toast";
import logoPromoja from "@/assets/logo-promoja.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — PromoJá Benefícios" },
      { name: "description", content: "Acesse sua conta PromoJá e aproveite descontos exclusivos." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.push({ kind: "error", title: "Não foi possível entrar", message: error.message });
      return;
    }
    toast.push({ kind: "success", title: "Bem-vindo!" });
    navigate({ to: "/" });
  };

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col px-6 pt-10 pb-8 animate-fade-up overflow-y-auto">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {/* halo laranja pulsante atrás da logo */}
              <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-br from-primary/40 via-primary-glow/30 to-transparent blur-2xl" />
              <div className="absolute inset-4 -z-10 rounded-full bg-primary/20 blur-xl" />
              <img
                src={logoPromoja}
                alt="PromoJá"
                className="relative h-40 w-40 object-contain drop-shadow-[0_8px_30px_rgba(255,90,30,0.55)]"
              />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-glow">
              Benefícios para associados
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 rounded-3xl glass p-6 shadow-elev">
            <h2 className="text-lg font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre para acessar suas ofertas exclusivas.
            </p>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </span>
              <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
                <Mail size={18} className="text-muted-foreground" />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </span>
              <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-3 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
                <Lock size={18} className="text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPwd((v) => !v)}
                  className="press p-1 text-muted-foreground"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="press mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-primary font-bold text-primary-foreground shadow-glow disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem cadastro?{" "}
            <Link to="/registro" className="font-bold text-primary-glow">
              Crie sua conta
            </Link>
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
