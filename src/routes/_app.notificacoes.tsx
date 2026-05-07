import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDateTimeBR } from "@/lib/format";
import type { Notificacao } from "@/lib/types";

export const Route = createFileRoute("/_app/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — PromoJá" }] }),
  component: NotifPage,
});

function NotifPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data ?? []) as Notificacao[]);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel("notif-list")
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

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notificacoes").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
  };

  const unread = items.filter((n) => !n.lida).length;

  return (
    <>
      <ScreenHeader
        title="Notificações"
        subtitle={unread > 0 ? `${unread} não lidas` : "Tudo em dia"}
        right={
          unread > 0 ? (
            <button onClick={markAllRead} className="press flex h-9 items-center gap-1 rounded-full bg-surface-2 px-3 text-xs font-semibold text-foreground">
              <CheckCheck size={14} /> Ler todas
            </button>
          ) : null
        }
      />
      <Scroll>
        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-surface-2 p-8 text-center">
              <Bell className="mx-auto text-muted-foreground" size={32} />
              <p className="mt-3 text-sm font-semibold text-foreground">Sem notificações</p>
              <p className="mt-1 text-xs text-muted-foreground">Você está em dia!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((n) => (
                <li
                  key={n.id}
                  onClick={async () => {
                    if (!n.lida) await supabase.from("notificacoes").update({ lida: true }).eq("id", n.id);
                  }}
                  className={
                    "press cursor-pointer rounded-2xl p-4 ring-1 ring-border " +
                    (n.lida ? "bg-surface-2" : "bg-surface")
                  }
                >
                  <div className="flex items-start gap-3">
                    <span className={"mt-1 inline-block h-2 w-2 shrink-0 rounded-full " + (n.lida ? "bg-transparent" : "bg-primary-glow")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground">{n.titulo}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.mensagem}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">{formatDateTimeBR(n.created_at)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Scroll>
    </>
  );
}
