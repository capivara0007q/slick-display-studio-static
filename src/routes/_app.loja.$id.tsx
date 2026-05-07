import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Phone, Heart, Store, Loader2, Navigation, Sparkles } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { OfferCard } from "@/components/OfferCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { mapsUrl, wazeUrl } from "@/lib/economia";
import type { Cupom, Loja } from "@/lib/types";

export const Route = createFileRoute("/_app/loja/$id")({
  component: LojaPage,
});

function LojaPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: l }, { data: cs }, { data: fav }] = await Promise.all([
        supabase.from("lojas").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("cupons")
          .select("*")
          .eq("loja_id", id)
          .eq("ativo", true)
          .order("created_at", { ascending: false }),
        user
          ? supabase
              .from("favoritos")
              .select("id")
              .eq("user_id", user.id)
              .eq("loja_id", id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      const lojaData = (l as Loja) ?? null;
      setLoja(lojaData);
      setCupons(((cs ?? []) as Cupom[]).map((c) => ({ ...c, loja: lojaData ?? undefined })));
      setIsFav(!!fav);
      setLoading(false);
    };
    load();
  }, [id, user]);

  const toggleFav = async () => {
    if (!user) return;
    if (isFav) {
      setIsFav(false);
      await supabase.from("favoritos").delete().eq("user_id", user.id).eq("loja_id", id);
    } else {
      setIsFav(true);
      await supabase.from("favoritos").insert({ user_id: user.id, loja_id: id });
    }
  };

  if (loading) {
    return (
      <>
        <ScreenHeader title="Loja" back />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!loja) {
    return (
      <>
        <ScreenHeader title="Loja" back />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">Loja não encontrada.</p>
        </div>
      </>
    );
  }

  const mapHref = mapsUrl(loja);
  const wazeHref = wazeUrl(loja.endereco);

  return (
    <>
      <ScreenHeader
        title={loja.nome}
        back
        right={
          <button
            onClick={toggleFav}
            aria-label={isFav ? "Remover favorito" : "Favoritar"}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
          >
            <Heart size={18} className={isFav ? "fill-destructive text-destructive" : "text-muted-foreground"} />
          </button>
        }
      />
      <Scroll>
        <div className="px-5">
          {/* Foto */}
          <div className="overflow-hidden rounded-3xl ring-1 ring-border">
            {loja.foto_url ? (
              <img src={loja.foto_url} alt={loja.nome} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 w-full items-center justify-center bg-gradient-primary">
                <Store className="text-primary-foreground" size={48} />
              </div>
            )}
          </div>

          {/* Cabeçalho */}
          <div className="mt-4">
            <h1 className="font-display text-2xl font-black text-foreground">{loja.nome}</h1>
            {loja.descricao && <p className="mt-1 text-sm text-muted-foreground">{loja.descricao}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {loja.estrelas > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold ring-1 ring-border">
                  <Star size={12} className="fill-current text-warning" /> {loja.estrelas.toFixed(1)}
                </span>
              )}
              <span
                className={
                  "rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 " +
                  (cupons.length > 0
                    ? "bg-success/15 text-success ring-success/30"
                    : "bg-muted/20 text-muted-foreground ring-border")
                }
              >
                {cupons.length > 0
                  ? `${cupons.length} ${cupons.length === 1 ? "cupom" : "cupons"} disponível`
                  : "Sem cupons no momento"}
              </span>
            </div>
          </div>

          {/* Serviços / o que oferece */}
          {loja.servicos && loja.servicos.length > 0 && (
            <div className="mt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles size={12} className="mr-1 inline" /> O que oferece
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {loja.servicos.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-gradient-card px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-border"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contato e localização */}
          <div className="mt-5 space-y-2">
            {loja.endereco && (
              <div className="flex items-start gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border">
                <MapPin size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <p className="flex-1 text-sm text-foreground">{loja.endereco}</p>
              </div>
            )}
            {loja.telefone && (
              <a
                href={`tel:${loja.telefone.replace(/\D/g, "")}`}
                className="press flex items-center gap-3 rounded-xl bg-surface-2 p-3 ring-1 ring-border"
              >
                <Phone size={16} className="shrink-0 text-muted-foreground" />
                <p className="flex-1 text-sm text-foreground">{loja.telefone}</p>
                <span className="text-[11px] font-bold text-primary-glow">Ligar</span>
              </a>
            )}
          </div>

          {/* Botão de localização */}
          {mapHref && (
            <div className="mt-3">
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="press flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-3 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                <Navigation size={16} /> Localização
              </a>
            </div>
          )}

          {/* Cupons */}
          <div className="mt-6 pb-6">
            <h2 className="text-base font-bold text-foreground">Cupons disponíveis</h2>
            {cupons.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-surface-2 p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
                Esta loja ainda não tem cupons disponíveis.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {cupons.map((c) => (
                  <OfferCard key={c.id} cupom={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Scroll>
    </>
  );
}
