import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TabBar } from "@/components/TabBar";
import { useAuth } from "@/lib/auth";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (profile && profile.approval_status !== "aprovado") {
      navigate({ to: "/aguardando", replace: true });
    }
  }, [loading, user, profile, navigate]);

  if (loading || !user || !profile || profile.approval_status !== "aprovado") {
    return (
      <PhoneFrame>
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow animate-pulse">
            <Sparkles className="text-primary-foreground" size={24} />
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <main className="flex h-full w-full flex-col animate-fade-up">
        <Outlet />
      </main>
      <TabBar />
    </PhoneFrame>
  );
}
