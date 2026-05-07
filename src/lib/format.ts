export function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

export function formatDateBR(iso: string | null | undefined) {
  if (!iso) return "—";
  // Use UTC parse then format manually to avoid hydration locale mismatch
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata um valor de desconto para exibição.
 * - "30" -> "-30%"
 * - "30%" -> "-30%"
 * - "-30%" -> "-30%"
 * - "R$ 30" -> "-R$ 30"
 * - "Leve 2 pague 1" -> "Leve 2 pague 1" (texto livre permanece)
 */
export function formatDesconto(value: string | number | null | undefined): string {
  if (value == null) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  // Já vem com sinal de menos -> mantém
  if (raw.startsWith("-")) return raw;

  // Só número (ex: "30") -> assume porcentagem
  if (/^\d+([.,]\d+)?$/.test(raw)) return `-${raw}%`;

  // Número com % (ex: "30%") -> adiciona menos
  if (/^\d+([.,]\d+)?\s*%$/.test(raw)) return `-${raw}`;

  // Valor em reais (ex: "R$ 30", "R$30,00")
  if (/^R\$\s*\d/i.test(raw)) return `-${raw}`;

  // Texto livre (ex: "Leve 2 pague 1") -> mantém como está
  return raw;
}

export function formatDateTimeBR(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hh}:${mm}`;
}
