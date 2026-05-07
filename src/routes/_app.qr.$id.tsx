import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTimeBR } from "@/lib/format";
import type { Solicitacao, Cupom, Loja } from "@/lib/types";

export const Route = createFileRoute("/_app/qr/$id")({
  component: QRPage,
});

function QRPage() {
  const { id } = Route.useParams();
  const [sol, setSol] = useState<Solicitacao | null>(null);
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase
        .from("solicitacoes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!s) {
        setLoading(false);
        return;
      }
      setSol(s as Solicitacao);
      const { data: c } = await supabase
        .from("cupons")
        .select("*")
        .eq("id", s.cupom_id)
        .maybeSingle();
      setCupom((c as Cupom) ?? null);
      if (c) {
        const { data: l } = await supabase
          .from("lojas")
          .select("*")
          .eq("id", c.loja_id)
          .maybeSingle();
        setLoja((l as Loja) ?? null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <>
        <ScreenHeader title="Cupom" back />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!sol) {
    return (
      <>
        <ScreenHeader title="Cupom" back />
        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Cupom não encontrado.
        </div>
      </>
    );
  }

  const isApproved = sol.status === "aprovada";
  const isPending = sol.status === "pendente";
  const isDenied = sol.status === "negada";

  return (
    <>
      <ScreenHeader title="Seu cupom" back />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="rounded-3xl bg-gradient-card ring-1 ring-border p-6 text-center">
          {isApproved ? (
            <>
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                <CheckCircle2 size={14} /> Aprovado
              </div>
              <h1 className="mt-3 font-display text-xl font-black text-foreground">{cupom?.titulo}</h1>
              {loja && <p className="text-xs text-muted-foreground">{loja.nome}</p>}

              <div className="mx-auto mt-5 inline-block rounded-2xl bg-white p-4 shadow-elev">
                <QRCodeSVG value={sol.codigo} size={180} level="H" />
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">Código</p>
              <p className="font-display text-2xl font-black tracking-[0.3em] text-foreground">{sol.codigo}</p>

              <p className="mt-4 text-xs text-muted-foreground">
                Apresente este QR ou código no estabelecimento para usar seu desconto.
              </p>
            </>
          ) : isPending ? (
            <>
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">
                <Clock size={14} /> Aguardando aprovação
              </div>
              <h1 className="mt-3 font-display text-xl font-black text-foreground">{cupom?.titulo}</h1>
              {loja && <p className="text-xs text-muted-foreground">{loja.nome}</p>}
              <p className="mt-6 text-sm text-muted-foreground">
                Sua solicitação está em análise. Você receberá uma notificação quando for aprovada.
              </p>
            </>
          ) : isDenied ? (
            <>
              <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
                <XCircle size={14} /> Recusado
              </div>
              <h1 className="mt-3 font-display text-xl font-black text-foreground">{cupom?.titulo}</h1>
              {sol.admin_resposta && (
                <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm text-foreground">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Motivo</p>
                  <p className="mt-1">{sol.admin_resposta}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Status: {sol.status}</p>
              {sol.used_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Utilizado em {formatDateTimeBR(sol.used_at)}
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Solicitado em {formatDateTimeBR(sol.created_at)}
        </p>
      </div>
    </>
  );
}
