import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, ChevronRight, Tag, MapPin, Store, Navigation, Clock } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { OfferCard } from "@/components/OfferCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { mapsUrl } from "@/lib/economia";
import type { Categoria, Cupom, Loja } from "@/lib/types";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Início — PromoJá" }] }),
  component: HomePage,
});

function HomePage() {
  const { profile } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: cats }, { data: cs }, { data: ls }] = await Promise.all([
        supabase.from("categorias").select("*").eq("ativa", true).order("ordem"),
        supabase
          .from("cupons")
          .select("*")
          .eq("ativo", true)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("lojas")
          .select("*")
          .eq("ativa", true)
          .order("estrelas", { ascending: false }),
      ]);
      const lojasMap = new Map<string, Loja>((ls ?? []).map((l) => [l.id, l as Loja]));
      const enriched = ((cs ?? []) as Cupom[]).map((c) => ({
        ...c,
        loja: c.loja_id ? lojasMap.get(c.loja_id) : undefined,
      }));
      setCategorias((cats ?? []) as Categoria[]);
      setCupons(enriched);
      setLojas((ls ?? []) as Loja[]);
      setLoading(false);
    };
    load();
  }, []);

  const firstName = profile?.nome?.split(" ")[0] ?? "";

  return (
    <>
      <ScreenHeader
        title={`Olá, ${firstName} 👋`}
        subtitle="Aproveite as ofertas para você"
        right={
          <Link
            to="/buscar"
            aria-label="Buscar"
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-surface-2"
          >
            <Search size={18} />
          </Link>
        }
      />
      <Scroll>
        {/* Hero */}
        <section className="px-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-glow">
            <Sparkles className="absolute -right-2 -top-2 opacity-20" size={120} />
            <p className="text-[11px] font-bold uppercase tracking-widest">Bem-vindo ao PromoJá</p>
            <h2 className="mt-1 font-display text-2xl font-black leading-tight">
              Descontos exclusivos toda semana
            </h2>
            <Link
              to="/buscar"
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-background/15 px-4 py-2 text-sm font-bold backdrop-blur"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* Categorias */}
        {categorias.length > 0 && (
          <section className="mt-6 px-5">
            <h3 className="text-base font-bold text-foreground">Categorias</h3>
            <div className="mt-3 -mx-5 overflow-x-auto px-5 no-scrollbar">
              <div className="flex gap-2.5">
                {categorias.map((c) => (
                  <Link
                    key={c.id}
                    to="/buscar"
                    search={{ cat: c.id }}
                    className="press shrink-0 rounded-full bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-border"
                  >
                    {c.nome}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Expirando em breve (próximos 7 dias) */}
        {(() => {
          const now = Date.now();
          const limite = now + 7 * 24 * 60 * 60 * 1000;
          const expirando = cupons
            .filter((c) => {
              if (!c.validade) return false;
              const t = new Date(c.validade).getTime();
              return t >= now && t <= limite;
            })
            .sort((a, b) => new Date(a.validade!).getTime() - new Date(b.validade!).getTime())
            .slice(0, 6);
          if (expirando.length === 0) return null;
          return (
            <section className="mt-6 px-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground">
                  <Clock size={16} className="text-warning" /> Expirando em breve
                </h3>
                <Link to="/buscar" className="text-xs font-bold text-warning press">
                  Ver todos
                </Link>
              </div>
              <div className="mt-3 -mx-5 overflow-x-auto px-5 no-scrollbar">
                <div className="flex gap-3">
                  {expirando.map((c) => (
                    <div key={c.id} className="w-40 shrink-0">
                      <OfferCard cupom={c} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Ofertas */}
        <section className="mt-6 px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Ofertas em destaque</h3>
            <Link to="/buscar" className="text-xs font-bold text-primary-glow press">
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : cupons.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl bg-surface-2 p-8 text-center">
              <Tag className="text-muted-foreground" size={32} />
              <p className="mt-3 text-sm font-semibold text-foreground">Nenhuma oferta ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Em breve teremos cupons incríveis pra você.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 overflow-hidden">
              {cupons.map((c) => (
                <OfferCard key={c.id} cupom={c} />
              ))}
            </div>
          )}
        </section>

        {/* Lojas parceiras com endereço */}
        {lojas.length > 0 && (
          <section className="mt-6 px-5 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Lojas parceiras</h3>
              <Link to="/lojas" className="text-xs font-bold text-primary-glow press">
                Ver todas
              </Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {lojas.slice(0, 6).map((l) => {
                const url = mapsUrl(l);
                return (
                  <div
                    key={l.id}
                    className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl bg-surface p-3 ring-1 ring-border shadow-elev"
                  >
                    <Link
                      to="/loja/$id"
                      params={{ id: l.id }}
                      className="press flex min-w-0 flex-1 items-center gap-3 overflow-hidden"
                    >
                      {l.foto_url ? (
                        <img
                          src={l.foto_url}
                          alt={l.nome}
                          className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                          <Store size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h4 className="max-w-full truncate text-sm font-bold text-foreground">
                          {l.nome}
                        </h4>
                        {l.endereco ? (
                          <p className="mt-0.5 flex min-w-0 max-w-full items-center gap-1 overflow-hidden text-[11px] text-muted-foreground">
                            <MapPin size={10} className="shrink-0" />
                            <span className="min-w-0 flex-1 truncate">{l.endereco}</span>
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Localização não informada
                          </p>
                        )}
                      </div>
                    </Link>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Como chegar"
                        className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
                      >
                        <Navigation size={16} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </Scroll>
    </>
  );
}
