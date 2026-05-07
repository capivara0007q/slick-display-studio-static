import { Link } from "@tanstack/react-router";
import { Star, MapPin } from "lucide-react";
import type { Cupom } from "@/lib/types";
import { formatDesconto } from "@/lib/format";

const FALLBACK_GRADIENTS = [
  "from-orange-500/40 via-red-500/30 to-amber-500/40",
  "from-emerald-500/40 via-teal-500/30 to-cyan-500/40",
  "from-violet-500/40 via-fuchsia-500/30 to-pink-500/40",
  "from-amber-500/40 via-orange-500/30 to-rose-500/40",
  "from-sky-500/40 via-blue-500/30 to-indigo-500/40",
  "from-cyan-500/40 via-sky-500/30 to-blue-500/40",
];

function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length];
}

export function OfferCard({ cupom }: { cupom: Cupom }) {
  const grad = gradientFor(cupom.id);
  return (
    <Link
      to="/oferta/$id"
      params={{ id: cupom.id }}
      className="press group block min-w-0 overflow-hidden rounded-2xl bg-surface ring-1 ring-border shadow-elev"
    >
      <div className={"relative h-32 overflow-hidden bg-gradient-to-br " + grad}>
        {cupom.foto_url && (
          <img
            src={cupom.foto_url}
            alt={cupom.titulo}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute right-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-gradient-primary px-2.5 py-1 text-[11px] font-extrabold text-primary-foreground shadow-glow">
          {formatDesconto(cupom.desconto)}
        </span>
        {cupom.loja?.estrelas != null && cupom.loja.estrelas > 0 && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full glass px-2 py-0.5 text-[11px] font-semibold text-foreground">
            <Star size={12} className="fill-current text-warning" />{" "}
            {cupom.loja.estrelas.toFixed(1)}
          </span>
        )}
      </div>
      <div className="min-w-0 overflow-hidden p-3">
        <h3 className="line-clamp-2 max-w-full overflow-hidden break-words text-sm font-bold leading-snug text-foreground [overflow-wrap:anywhere]">
          {cupom.titulo}
        </h3>
        {cupom.loja && (
          <p className="mt-1 line-clamp-1 max-w-full overflow-hidden break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {cupom.loja.nome}
          </p>
        )}
        {cupom.loja?.endereco && (
          <p className="mt-2 flex min-w-0 max-w-full items-center gap-1 overflow-hidden text-[11px] text-muted-foreground">
            <MapPin size={11} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">{cupom.loja.endereco}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
