import { Link, useLocation } from "@tanstack/react-router";
import { Home, Store, Heart, Ticket, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const tabs = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/lojas", label: "Lojas", icon: Store },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/solicitacoes", label: "Cupons", icon: Ticket },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function TabBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("lida", false);
      setUnread(count ?? 0);
    };
    load();
    const channel = supabase
      .channel("notif-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <nav aria-label="Navegação principal" className="absolute bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="mx-3 mb-3 rounded-2xl glass shadow-elev">
        <ul className="flex items-stretch justify-between px-2 py-1.5">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            const showBadge = to === "/solicitacoes" && unread > 0;
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className="press flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5"
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={
                      "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all " +
                      (active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground")
                    }
                  >
                    <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                    {showBadge && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </span>
                  <span className={"text-[10px] font-semibold tracking-wide " + (active ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
