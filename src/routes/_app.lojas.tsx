import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Star, MapPin, Heart, Store, Search, X, Loader2,
  Navigation, ChevronDown, SlidersHorizontal,
} from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import type { Loja } from "@/lib/types";
import {
  parseCoordsFromMapsUrl,
  haversineKm,
  formatDistance,
  getCurrentPosition,
  normalize,
  type Coords,
} from "@/lib/geo";

export const Route = createFileRoute("/_app/lojas")({
  head: () => ({ meta: [{ title: "Lojas — PromoJá" }] }),
  component: LojasPage,
});

const PAGE_SIZE = 20;

type Sort = "nome" | "distancia" | "cupons" | "estrelas";
type LojaEnriched = Loja & {
  cuponsCount: number;
  coords: Coords | null;
  distanciaKm: number | null;
};

function LojasPage() {
  const { user, profile } = useAuth();
  const toast = useToast();

  // ---- Estado base ----
  const [lojas, setLojas] = useState<LojaEnriched[]>([]);
  const [cuponsMap, setCuponsMap] = useState<Map<string, number>>(new Map());
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(true);
  const [pagina, setPagina] = useState(0);

  // ---- Filtros ----
  const [busca, setBusca] = useState(""); // bairro/loja
  const [cidade, setCidade] = useState<string>(profile?.cidade ?? "");
  const [sort, setSort] = useState<Sort>("nome");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // ---- Geolocalização ----
  const [minhaLoc, setMinhaLoc] = useState<Coords | null>(null);
  const [pedindoLoc, setPedindoLoc] = useState(false);

  // Pré-preenche cidade do perfil quando carrega
  useEffect(() => {
    if (profile?.cidade && !cidade) setCidade(profile.cidade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.cidade]);

  // ---- Carrega contagem de cupons (1x) ----
  useEffect(() => {
    supabase
      .from("cupons")
      .select("loja_id")
      .eq("ativo", true)
      .then(({ data }) => {
        const m = new Map<string, number>();
        (data ?? []).forEach((c: { loja_id: string }) => {
          m.set(c.loja_id, (m.get(c.loja_id) ?? 0) + 1);
        });
        setCuponsMap(m);
      });
  }, []);

  // ---- Carrega favoritos do usuário ----
  useEffect(() => {
    if (!user) return;
    supabase
      .from("favoritos")
      .select("loja_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setFavoritos(new Set((data ?? []).map((f: { loja_id: string }) => f.loja_id)));
      });
  }, [user]);

  // ---- Função paginada ----
  const carregarPagina = useCallback(
    async (paginaAlvo: number, append: boolean) => {
      if (paginaAlvo === 0) setLoadingInicial(true);
      else setCarregandoMais(true);

      let query = supabase
        .from("lojas")
        .select("*")
        .eq("ativa", true)
        .order("nome", { ascending: true })
        .range(paginaAlvo * PAGE_SIZE, paginaAlvo * PAGE_SIZE + PAGE_SIZE - 1);

      // Filtro por cidade/bairro no servidor (ilike no endereço)
      const filtroTexto = busca.trim() || cidade.trim();
      if (filtroTexto) {
        // Procura tanto no endereço quanto no nome (OR)
        const safe = filtroTexto.replace(/[%,]/g, "");
        query = query.or(`endereco.ilike.%${safe}%,nome.ilike.%${safe}%`);
      }

      const { data, error } = await query;
      if (error) {
        toast.push({ kind: "error", title: "Erro ao carregar lojas" });
        setLoadingInicial(false);
        setCarregandoMais(false);
        return;
      }

      const novas: LojaEnriched[] = (data ?? []).map((l: Loja) => {
        const coords = parseCoordsFromMapsUrl(l.maps_url);
        return {
          ...l,
          cuponsCount: cuponsMap.get(l.id) ?? 0,
          coords,
          distanciaKm: coords && minhaLoc ? haversineKm(minhaLoc, coords) : null,
        };
      });

      setLojas((prev) => (append ? [...prev, ...novas] : novas));
      setTemMais((data ?? []).length === PAGE_SIZE);
      setPagina(paginaAlvo);
      setLoadingInicial(false);
      setCarregandoMais(false);
    },
    [busca, cidade, cuponsMap, minhaLoc, toast],
  );

  // Carrega 1ª página quando filtros mudam (com debounce na busca)
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      carregarPagina(0, false);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, cidade, cuponsMap]);

  // Re-aplica distância quando localização chega (sem refazer query)
  useEffect(() => {
    if (!minhaLoc) return;
    setLojas((prev) =>
      prev.map((l) => ({
        ...l,
        distanciaKm: l.coords ? haversineKm(minhaLoc, l.coords) : null,
      })),
    );
  }, [minhaLoc]);

  // ---- Pedir GPS ----
  const ativarGPS = async () => {
    if (minhaLoc) {
      setMinhaLoc(null);
      if (sort === "distancia") setSort("nome");
      return;
    }
    setPedindoLoc(true);
    try {
      const pos = await getCurrentPosition();
      setMinhaLoc(pos);
      setSort("distancia");
      toast.push({ kind: "success", title: "Localização ativada" });
    } catch {
      toast.push({ kind: "error", title: "Não consegui acessar sua localização" });
    } finally {
      setPedindoLoc(false);
    }
  };

  // ---- Ordenação no cliente ----
  const lojasOrdenadas = useMemo(() => {
    const arr = [...lojas];
    arr.sort((a, b) => {
      if (sort === "distancia") {
        const da = a.distanciaKm ?? Infinity;
        const db = b.distanciaKm ?? Infinity;
        if (da !== db) return da - db;
      }
      if (sort === "cupons") {
        if (a.cuponsCount !== b.cuponsCount) return b.cuponsCount - a.cuponsCount;
      }
      if (sort === "estrelas") {
        if (a.estrelas !== b.estrelas) return b.estrelas - a.estrelas;
      }
      return normalize(a.nome).localeCompare(normalize(b.nome));
    });
    return arr;
  }, [lojas, sort]);

  // ---- Favoritos ----
  const toggleFav = async (lojaId: string) => {
    if (!user) return;
    const isFav = favoritos.has(lojaId);
    const next = new Set(favoritos);
    if (isFav) {
      next.delete(lojaId);
      setFavoritos(next);
      await supabase.from("favoritos").delete().eq("user_id", user.id).eq("loja_id", lojaId);
    } else {
      next.add(lojaId);
      setFavoritos(next);
      await supabase.from("favoritos").insert({ user_id: user.id, loja_id: lojaId });
    }
  };

  const limparFiltros = () => {
    setBusca("");
    setCidade("");
    setSort("nome");
  };

  const filtrosAtivos = !!busca || !!cidade || sort !== "nome";

  return (
    <>
      <ScreenHeader
        title="Lojas"
        subtitle={`${lojas.length}${temMais ? "+" : ""} parceiras${minhaLoc ? " • localização ativa" : ""}`}
      />
      <Scroll>
        <div className="px-4 pt-2 pb-4 space-y-3">
          {/* Barra de busca */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              inputMode="search"
              placeholder="Buscar loja, bairro ou rua..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-full border border-border bg-surface py-3 pl-10 pr-10 text-sm outline-none ring-0 focus:border-primary"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-surface-2"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Atalhos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <button
              onClick={ativarGPS}
              disabled={pedindoLoc}
              className={`press flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 whitespace-nowrap ${
                minhaLoc
                  ? "bg-primary/15 text-primary ring-primary/30"
                  : "bg-surface text-foreground ring-border"
              }`}
            >
              {pedindoLoc ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Navigation size={13} />
              )}
              {minhaLoc ? "Perto de mim" : "Usar minha localização"}
            </button>

            <button
              onClick={() => setFiltrosAbertos((v) => !v)}
              className={`press flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 whitespace-nowrap ${
                filtrosAtivos
                  ? "bg-primary/15 text-primary ring-primary/30"
                  : "bg-surface text-foreground ring-border"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filtros
              <ChevronDown
                size={13}
                className={`transition-transform ${filtrosAbertos ? "rotate-180" : ""}`}
              />
            </button>

            {filtrosAtivos && (
              <button
                onClick={limparFiltros}
                className="press text-xs font-semibold text-muted-foreground underline whitespace-nowrap px-2"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Painel de filtros */}
          {filtrosAbertos && (
            <div className="rounded-2xl border border-border bg-surface p-3 space-y-3 animate-fade-up">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Cidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Goiânia"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Ordenar por
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: "nome", label: "Nome (A–Z)" },
                    { v: "distancia", label: "Distância", disabled: !minhaLoc },
                    { v: "cupons", label: "+ Cupons" },
                    { v: "estrelas", label: "+ Avaliação" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      disabled={opt.disabled}
                      onClick={() => setSort(opt.v as Sort)}
                      className={`press rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${
                        sort === opt.v
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-background text-foreground ring-border"
                      } ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {opt.label}
                      {opt.v === "distancia" && !minhaLoc && (
                        <span className="block text-[9px] font-normal opacity-70">
                          ative o GPS
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista */}
          <div className="space-y-2.5">
            {loadingInicial ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
              ))
            ) : lojasOrdenadas.length === 0 ? (
              <div className="rounded-2xl bg-surface-2 p-8 text-center">
                <Store className="mx-auto text-muted-foreground" size={32} />
                <p className="mt-3 text-sm font-semibold">Nenhuma loja encontrada</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {filtrosAtivos ? "Tente ajustar os filtros" : "Volte mais tarde"}
                </p>
              </div>
            ) : (
              lojasOrdenadas.map((l) => (
                <LojaCard
                  key={l.id}
                  loja={l}
                  isFav={favoritos.has(l.id)}
                  onToggleFav={() => toggleFav(l.id)}
                />
              ))
            )}
          </div>

          {/* Carregar mais */}
          {!loadingInicial && temMais && (
            <button
              onClick={() => carregarPagina(pagina + 1, true)}
              disabled={carregandoMais}
              className="press mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface py-3 text-sm font-semibold text-foreground ring-1 ring-border disabled:opacity-50"
            >
              {carregandoMais ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Carregando...
                </>
              ) : (
                "Carregar mais lojas"
              )}
            </button>
          )}

          <div className="h-4" />
        </div>
      </Scroll>
    </>
  );
}

function LojaCard({
  loja,
  isFav,
  onToggleFav,
}: {
  loja: LojaEnriched;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  return (
    <div className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-surface p-3 ring-1 ring-border shadow-elev">
      <Link
        to="/loja/$id"
        params={{ id: loja.id }}
        className="press flex min-w-0 flex-1 items-center gap-3 overflow-hidden"
      >
        {loja.foto_url ? (
          <img
            src={loja.foto_url}
            alt={loja.nome}
            loading="lazy"
            decoding="async"
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
            <Store size={22} />
          </div>
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{loja.nome}</h3>
            {loja.distanciaKm !== null && (
              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                {formatDistance(loja.distanciaKm)}
              </span>
            )}
          </div>
          {loja.endereco && (
            <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin size={10} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{loja.endereco}</span>
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            {loja.cuponsCount > 0 ? (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                {loja.cuponsCount} {loja.cuponsCount === 1 ? "cupom" : "cupons"}
              </span>
            ) : (
              <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                Sem cupons
              </span>
            )}
            {loja.estrelas > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-warning">
                <Star size={10} className="fill-current" /> {loja.estrelas.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={onToggleFav}
        aria-label={isFav ? "Remover favorito" : "Favoritar"}
        className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border"
      >
        <Heart
          size={18}
          className={isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}
        />
      </button>
    </div>
  );
}
