import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Store, MapPin } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Scroll } from "@/components/Scroll";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Loja } from "@/lib/types";

export const Route = createFileRoute("/_app/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — PromoJá" }] }),
  component: FavoritosPage,
});

type LojaFav = Loja & { cuponsCount: number };

function FavoritosPage() {
  const { user } = useAuth();
  const [lojas, setLojas] = useState<LojaFav[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: favs } = await supabase
      .from("favoritos")
      .select("loja_id")
      .eq("user_id", user.id);
    const ids = (favs ?? []).map((f: { loja_id: string }) => f.loja_id);
    if (ids.length === 0) {
      setLojas([]);
      setLoading(false);
      return;
    }
    const [{ data: ls }, { data: cs }] = await Promise.all([
      supabase.from("lojas").select("*").in("id", ids).eq("ativa", true),
      supabase.from("cupons").select("loja_id").in("loja_id", ids).eq("ativo", true),
    ]);
    const counts = new Map<string, number>();
    (cs ?? []).forEach((c: { loja_id: string }) => {
      counts.set(c.loja_id, (counts.get(c.loja_id) ?? 0) + 1);
    });
    setLojas(((ls ?? []) as Loja[]).map((l) => ({ ...l, cuponsCount: counts.get(l.id) ?? 0 })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const remove = async (lojaId: string) => {
    if (!user) return;
    setLojas((prev) => prev.filter((l) => l.id !== lojaId));
    await supabase.from("favoritos").delete().eq("user_id", user.id).eq("loja_id", lojaId);
  };

  return (
    <>
      <ScreenHeader title="Favoritos" subtitle={`${lojas.length} ${lojas.length === 1 ? "loja" : "lojas"}`} />
      <Scroll>
        <div className="px-5 space-y-3">
          {loading ? (
            [1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />)
          ) : lojas.length === 0 ? (
            <div className="rounded-2xl bg-surface-2 p-8 text-center">
              <Heart className="mx-auto text-muted-foreground" size={32} />
              <p className="mt-3 text-sm font-semibold">Você ainda não tem favoritos</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Toque no coração nas lojas que você curtiu.
              </p>
              <Link
                to="/lojas"
                className="press mt-4 inline-block rounded-full bg-gradient-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Ver lojas
              </Link>
            </div>
          ) : (
            lojas.map((l) => (
              <div
                key={l.id}
                className="relative flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border shadow-elev"
              >
                <Link
                  to="/loja/$id"
                  params={{ id: l.id }}
                  className="press flex flex-1 items-center gap-3"
                >
                  {l.foto_url ? (
                    <img src={l.foto_url} alt={l.nome} className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                      <Store size={22} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-foreground">{l.nome}</h3>
                    {l.endereco && (
                      <p className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <MapPin size={10} /> <span className="truncate">{l.endereco}</span>
                      </p>
                    )}
                    <div className="mt-1.5">
                      {l.cuponsCount > 0 ? (
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                          {l.cuponsCount} {l.cuponsCount === 1 ? "cupom" : "cupons"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          Sem cupons
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => remove(l.id)}
                  aria-label="Remover favorito"
                  className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border"
                >
                  <Heart size={18} className="fill-destructive text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </Scroll>
    </>
  );
}
