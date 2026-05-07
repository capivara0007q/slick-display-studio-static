import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Phone, Calendar, Ticket, Loader2, PiggyBank, Clock } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { formatDateBR, formatDesconto } from "@/lib/format";
import { brl, economiaCupom } from "@/lib/economia";
import type { Cupom, Loja } from "@/lib/types";

export const Route = createFileRoute("/_app/oferta/$id")({
  component: OfertaPage,
});

function OfertaPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [cupom, setCupom] = useState<Cupom | null>(null);
  const [loja, setLoja] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase.from("cupons").select("*").eq("id", id).maybeSingle();
      if (!c) {
        setLoading(false);
        return;
      }
      const { data: l } = await supabase.from("lojas").select("*").eq("id", c.loja_id).maybeSingle();
      setCupom(c as Cupom);
      setLoja((l as Loja) ?? null);

      if (user) {
        const { data: existing } = await supabase
          .from("solicitacoes")
          .select("id")
          .eq("user_id", user.id)
          .eq("cupom_id", id)
          .in("status", ["pendente", "aprovada"])
          .limit(1);
        setHasPending(!!existing && existing.length > 0);
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const onResgatar = async () => {
    if (!user || !cupom) return;
    setSubmitting(true);
    const { error } = await supabase.from("solicitacoes").insert({
      user_id: user.id,
      cupom_id: cupom.id,
    });
    setSubmitting(false);
    if (error) {
      console.error("[resgatar] erro:", error);
      toast.push({
        kind: "error",
        title: "Erro ao resgatar",
        message: error.message || "Tente novamente.",
      });
      return;
    }
    setHasPending(true);
    setShowAnaliseModal(true);
  };

  if (loading) {
    return (
      <>
        <ScreenHeader title="Oferta" back />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!cupom) {
    return (
      <>
        <ScreenHeader title="Oferta" back />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">Oferta não encontrada.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Detalhes" back />
      <Scroll>
        <div className="px-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/40 via-red-500/30 to-amber-500/40 ring-1 ring-border">
            {cupom.foto_url ? (
              <img src={cupom.foto_url} alt={cupom.titulo} className="h-48 w-full object-cover" />
            ) : (
              <div className="h-48 w-full" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <span className="inline-block rounded-full bg-gradient-primary px-3 py-1 text-xs font-extrabold text-primary-foreground shadow-glow">
                {formatDesconto(cupom.desconto)}
              </span>
            </div>
          </div>

          <h1 className="mt-5 font-display text-2xl font-black text-foreground">{cupom.titulo}</h1>
          {loja && <p className="mt-1 text-sm text-muted-foreground">{loja.nome}</p>}

          {/* Economia */}
          {(cupom.preco_original || economiaCupom(cupom) > 0) && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 p-4 ring-1 ring-success/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                <PiggyBank size={20} />
              </div>
              <div className="flex-1">
                {economiaCupom(cupom) > 0 ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-success">Você economiza</p>
                    <p className="font-display text-xl font-black text-foreground">{brl(economiaCupom(cupom))}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-foreground">Aproveite o desconto!</p>
                )}
                {cupom.preco_original && cupom.preco_original > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    De <span className="line-through">{brl(Number(cupom.preco_original))}</span> com {formatDesconto(cupom.desconto)}
                  </p>
                )}
              </div>
            </div>
          )}

          {loja && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-3 ring-1 ring-border">
              {loja.foto_url ? (
                <img src={loja.foto_url} alt={loja.nome} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-primary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{loja.nome}</p>
                {loja.estrelas > 0 && (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star size={12} className="fill-current text-warning" />
                    {loja.estrelas.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          )}

          {cupom.descricao && (
            <div className="mt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{cupom.descricao}</p>
            </div>
          )}

          <div className="mt-5 space-y-2">
            {loja?.endereco && (
              <Row icon={<MapPin size={16} />} text={loja.endereco} />
            )}
            {loja?.telefone && <Row icon={<Phone size={16} />} text={loja.telefone} />}
            {cupom.validade && (
              <Row icon={<Calendar size={16} />} text={`Válido até ${formatDateBR(cupom.validade)}`} />
            )}
          </div>
          <div className="h-32" />
        </div>
      </Scroll>

      <div className="absolute inset-x-0 bottom-[88px] z-50 px-5 pt-3 pb-2 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={onResgatar}
          disabled={submitting || hasPending}
          className="press flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          <Ticket size={18} />
          {hasPending ? "Já solicitado" : submitting ? "Enviando..." : "Resgatar cupom"}
        </button>
      </div>

      {showAnaliseModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 px-6 animate-fade-up">
          <div className="w-full max-w-sm rounded-3xl bg-surface-1 p-6 ring-1 ring-border shadow-elev">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/20 ring-4 ring-warning/10">
              <Clock className="text-warning" size={28} />
            </div>
            <h2 className="mt-4 text-center font-display text-xl font-black text-foreground">
              Aguarde a análise
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sua solicitação foi enviada ao estabelecimento. Você receberá uma notificação assim que for aprovada ou recusada.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => navigate({ to: "/solicitacoes" })}
                className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary font-bold text-primary-foreground shadow-glow"
              >
                Ir para análise
              </button>
              <button
                onClick={() => setShowAnaliseModal(false)}
                className="press h-11 w-full rounded-2xl bg-surface-2 text-sm font-semibold text-foreground"
              >
                Continuar aqui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-sm text-foreground">{text}</p>
    </div>
  );
}
