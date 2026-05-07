import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import logoPromoja from "@/assets/logo-promoja.png";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (profile && profile.approval_status !== "aprovado") {
      navigate({ to: "/aguardando", replace: true });
      return;
    }
    navigate({ to: "/home", replace: true });
  }, [loading, user, profile, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <img
          src={logoPromoja}
          alt="PromoJá"
          className="h-24 w-24 object-contain animate-pulse drop-shadow-[0_0_30px_rgba(255,90,30,0.35)]"
        />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
