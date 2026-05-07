import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X, SlidersHorizontal, Check } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { OfferCard } from "@/components/OfferCard";
import { supabase } from "@/integrations/supabase/client";
import type { Categoria, Cupom, Loja } from "@/lib/types";

type SearchParams = { cat?: string };
type SortKey = "novos" | "desconto" | "expirando";

export const Route = createFileRoute("/_app/buscar")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  head: () => ({ meta: [{ title: "Buscar — PromoJá" }] }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | undefined>(search.cat);
  const [minDesconto, setMinDesconto] = useState(0);
  const [sort, setSort] = useState<SortKey>("novos");
  const [showFilters, setShowFilters] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: cats }, { data: cs }, { data: ls }] = await Promise.all([
        supabase.from("categorias").select("*").eq("ativa", true).order("ordem"),
        supabase.from("cupons").select("*").eq("ativo", true),
        supabase.from("lojas").select("*").eq("ativa", true),
      ]);
      const lojasMap = new Map<string, Loja>((ls ?? []).map((l) => [l.id, l as Loja]));
      const enriched = ((cs ?? []) as Cupom[]).map((c) => ({
        ...c,
        loja: c.loja_id ? lojasMap.get(c.loja_id) : undefined,
      }));
      setCategorias((cats ?? []) as Categoria[]);
      setCupons(enriched);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = cupons.filter((c) => {
      if (cat && c.loja?.categoria_id !== cat) return false;
      if (minDesconto > 0 && (c.desconto_percentual ?? 0) < minDesconto) return false;
      if (q) {
        const text = `${c.titulo} ${c.descricao ?? ""} ${c.loja?.nome ?? ""}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      return true;
    });

    if (sort === "desconto") {
      list = [...list].sort((a, b) => (b.desconto_percentual ?? 0) - (a.desconto_percentual ?? 0));
    } else if (sort === "expirando") {
      list = [...list]
        .filter((c) => c.validade && new Date(c.validade).getTime() >= now)
        .sort((a, b) => new Date(a.validade!).getTime() - new Date(b.validade!).getTime());
    } else {
      list = [...list].sort((a, b) => b.id.localeCompare(a.id));
    }
    return list;
  }, [cupons, q, cat, minDesconto, sort]);

  const activeFilters = (cat ? 1 : 0) + (minDesconto > 0 ? 1 : 0) + (sort !== "novos" ? 1 : 0);

  return (
    <>
      <ScreenHeader
        title="Buscar"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "oferta" : "ofertas"}`}
        right={
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Filtros"
            className="press relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border"
          >
            <SlidersHorizontal size={18} className={showFilters ? "text-primary-glow" : "text-muted-foreground"} />
            {activeFilters > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-background">
                {activeFilters}
              </span>
            )}
          </button>
        }
      />
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar lojas, ofertas..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="press text-muted-foreground" aria-label="Limpar">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categorias */}
        <div className="mt-3 -mx-5 overflow-x-auto px-5 no-scrollbar">
          <div className="flex gap-2">
            <Chip active={!cat} onClick={() => setCat(undefined)} label="Tudo" />
            {categorias.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.nome} />
            ))}
          </div>
        </div>

        {/* Painel de filtros expansível */}
        {showFilters && (
          <div className="mt-3 rounded-2xl bg-surface-2 p-4 ring-1 ring-border animate-fade-up">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Ordenar por
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {([
                  ["novos", "Mais recentes"],
                  ["desconto", "Maior desconto"],
                  ["expirando", "Expirando"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={
                      "press flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all " +
                      (sort === key
                        ? "bg-gradient-primary text-primary-foreground ring-transparent shadow-glow"
                        : "bg-background text-foreground ring-border")
                    }
                  >
                    {sort === key && <Check size={12} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Desconto mínimo
                </p>
                <p className="text-xs font-bold text-foreground">
                  {minDesconto === 0 ? "Qualquer" : `${minDesconto}%+`}
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={70}
                step={10}
                value={minDesconto}
                onChange={(e) => setMinDesconto(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
                <span>0</span>
                <span>20%</span>
                <span>40%</span>
                <span>70%+</span>
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setCat(undefined);
                  setMinDesconto(0);
                  setSort("novos");
                }}
                className="press mt-3 w-full rounded-xl bg-background py-2 text-xs font-bold text-destructive ring-1 ring-border"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <Scroll>
        <div className="px-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-surface-2 p-8 text-center text-sm text-muted-foreground">
              Nenhuma oferta encontrada.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((c) => (
                <OfferCard key={c.id} cupom={c} />
              ))}
            </div>
          )}
        </div>
      </Scroll>
    </>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "press shrink-0 rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-border " +
        (active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-surface-2 text-foreground")
      }
    >
      {label}
    </button>
  );
}
