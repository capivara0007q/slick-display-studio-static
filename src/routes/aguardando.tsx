import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Clock, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/aguardando")({
  component: AwaitingPage,
});

function AwaitingPage() {
  const { user, profile, loading, signOut, refresh } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (profile?.approval_status === "aprovado") {
      navigate({ to: "/home", replace: true });
    }
  }, [loading, user, profile, navigate]);

  // Auto-refresh every 8s to check for approval
  useEffect(() => {
    const t = setInterval(() => refresh(), 8000);
    return () => clearInterval(t);
  }, [refresh]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const isNegado = profile?.approval_status === "negado";

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center animate-fade-up">
          <div
            className={
              "flex h-20 w-20 items-center justify-center rounded-3xl shadow-glow " +
              (isNegado ? "bg-destructive/20 ring-2 ring-destructive/40" : "bg-gradient-primary")
            }
          >
            {isNegado ? (
              <AlertTriangle className="text-destructive" size={36} />
            ) : (
              <Clock className="text-primary-foreground" size={36} />
            )}
          </div>

          <h1 className="mt-6 font-display text-3xl font-black text-foreground">
            {isNegado ? "Cadastro recusado" : "Aguardando aprovação"}
          </h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {isNegado
              ? profile?.rejection_reason ||
                "Seu cadastro foi recusado. Entre em contato com o suporte."
              : "Seu cadastro foi recebido! Em breve um administrador vai aprovar sua conta. Você receberá uma notificação."}
          </p>

          {!isNegado && (
            <div className="mt-8 w-full max-w-sm rounded-2xl glass p-4 text-left">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="text-success" size={16} />
                Próximos passos
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Análise dos seus dados (geralmente em até 24h)</li>
                <li>• Você recebe a confirmação no app</li>
                <li>• Acesso liberado a todas as ofertas</li>
              </ul>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="press mt-8 inline-flex items-center gap-2 rounded-xl bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground ring-1 ring-border"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
