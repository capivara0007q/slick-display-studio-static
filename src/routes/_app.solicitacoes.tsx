import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ticket, Clock, CheckCircle2, XCircle, QrCode, Loader2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatDateTimeBR } from "@/lib/format";
import type { Solicitacao, Cupom, Loja } from "@/lib/types";

export const Route = createFileRoute("/_app/solicitacoes")({
  head: () => ({ meta: [{ title: "Meus cupons — PromoJá" }] }),
  component: SolicitacoesPage,
});

const statusLabel: Record<string, string> = {
  pendente: "Aguardando aprovação",
  aprovada: "Aprovado",
  negada: "Recusado",
  usada: "Utilizado",
  expirada: "Expirado",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "pendente") return <Clock size={16} className="text-warning" />;
  if (status === "aprovada") return <CheckCircle2 size={16} className="text-success" />;
  if (status === "negada") return <XCircle size={16} className="text-destructive" />;
  return <Ticket size={16} className="text-muted-foreground" />;
}

function SolicitacoesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: sols } = await supabase
        .from("solicitacoes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const cupomIds = [...new Set((sols ?? []).map((s) => s.cupom_id))];
      const { data: cs } = cupomIds.length
        ? await supabase.from("cupons").select("*").in("id", cupomIds)
        : { data: [] };
      const lojaIds = [...new Set((cs ?? []).map((c) => c.loja_id))];
      const { data: ls } = lojaIds.length
        ? await supabase.from("lojas").select("*").in("id", lojaIds)
        : { data: [] };
      const lojasMap = new Map<string, Loja>((ls ?? []).map((l) => [l.id, l as Loja]));
      const cuponsMap = new Map<string, Cupom>(
        (cs ?? []).map((c) => [
          c.id,
          { ...(c as Cupom), loja: lojasMap.get(c.loja_id) },
        ]),
      );
      const enriched = ((sols ?? []) as Solicitacao[]).map((s) => ({
        ...s,
        cupom: cuponsMap.get(s.cupom_id),
      }));
      setItems(enriched);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("my-solicitacoes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "solicitacoes", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <>
      <ScreenHeader title="Meus cupons" subtitle={`${items.length} solicitações`} />
      <Scroll>
        <div className="px-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-surface-2 p-8 text-center">
              <Ticket className="mx-auto text-muted-foreground" size={32} />
              <p className="mt-3 text-sm font-semibold text-foreground">Nenhum cupom ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Vá até uma oferta e toque em "Resgatar cupom".
              </p>
              <Link to="/buscar" className="press mt-4 inline-block rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow">
                Ver ofertas
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/qr/$id"
                    params={{ id: s.id }}
                    className="press block rounded-2xl bg-surface ring-1 ring-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                        {s.status === "aprovada" ? (
                          <QrCode className="text-primary-foreground" size={20} />
                        ) : (
                          <Ticket className="text-primary-foreground" size={20} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-bold text-foreground">
                          {s.cupom?.titulo ?? "Cupom"}
                        </p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {s.cupom?.loja?.nome ?? ""}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-foreground ring-1 ring-border">
                          <StatusIcon status={s.status} />
                          {statusLabel[s.status]}
                        </div>
                        {s.admin_resposta && (
                          <p className="mt-2 text-[11px] text-muted-foreground italic">
                            "{s.admin_resposta}"
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">
                        {s.cupom?.desconto ?? "—"}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Solicitado em {formatDateTimeBR(s.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Scroll>
    </>
  );
}
