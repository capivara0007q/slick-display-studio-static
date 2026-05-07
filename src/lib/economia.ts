// Utilidades para economia, formatação BRL e mapas
import type { Cupom } from "./types";

export function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Calcula a economia estimada de um cupom em reais.
 * - Se preco_original e desconto_percentual existem: preço × (% / 100)
 * - Caso contrário, retorna 0 (não soma).
 */
export function economiaCupom(c: Pick<Cupom, "preco_original" | "desconto_percentual">): number {
  const preco = Number(c.preco_original ?? 0);
  const pct = Number(c.desconto_percentual ?? 0);
  if (preco > 0 && pct > 0) return Math.round(preco * (pct / 100) * 100) / 100;
  return 0;
}

/**
 * Constrói uma URL de navegação para Google Maps a partir de:
 * 1) maps_url do cadastro (se existir, retorna direto)
 * 2) endereço em texto (fallback)
 */
export function mapsUrl(input: { maps_url?: string | null; endereco?: string | null }): string | null {
  if (input.maps_url && input.maps_url.trim()) return input.maps_url.trim();
  if (input.endereco && input.endereco.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.endereco.trim())}`;
  }
  return null;
}

/**
 * URL para Waze a partir do endereço (Waze não aceita URL Google).
 */
export function wazeUrl(endereco?: string | null): string | null {
  if (!endereco || !endereco.trim()) return null;
  return `https://waze.com/ul?q=${encodeURIComponent(endereco.trim())}&navigate=yes`;
}
